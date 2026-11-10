import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RenderOptions, AffineTransform } from '../types';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, ZoomIn, ZoomOut, Grid } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  vertices: Point[];
  functionIndex: number; // 0, 1, 2, 3 representing f1, f2, f3, f4
}

interface PolygonStepViewProps {
  alpha: number;
  beta: number;
  transforms: AffineTransform[];
  renderOptions: RenderOptions;
  setRenderOptions: React.Dispatch<React.SetStateAction<RenderOptions>>;
}

const COLORS = [
  { stroke: '#ff3366', fill: 'rgba(255, 51, 102, 0.25)' }, // f1
  { stroke: '#ffcc00', fill: 'rgba(255, 204, 0, 0.25)' },   // f2
  { stroke: '#00ff88', fill: 'rgba(0, 255, 136, 0.25)' },   // f3
  { stroke: '#00d4ff', fill: 'rgba(0, 212, 255, 0.25)' },   // f4
];

export const PolygonStepView: React.FC<PolygonStepViewProps> = ({
  alpha,
  beta,
  transforms,
  renderOptions,
  setRenderOptions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  
  const [step, setStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fillPolygons, setFillPolygons] = useState<boolean>(true);

  // Initial ABCD Parallelogram vertices requested by user
  // A(-0.5, 0), B(0.5, 0), C(0, -1), D(1, -1)
  const initialVertices: Point[] = [
    { x: -0.5, y: 0 },   // A
    { x: 0.5, y: 0 },    // B
    { x: 1.0, y: -1.0 }, // D
    { x: 0.0, y: -1.0 }, // C
  ];

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = Math.min(width, window.innerHeight * 0.75);
        setCanvasSize({ width: Math.max(400, width), height: Math.max(400, height) });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Apply affine transform function i (0 to 3) to a point
  const applyTransform = useCallback((p: Point, funcIdx: number): Point => {
    let nx = p.x;
    let ny = p.y;

    if (funcIdx === 0) {
      // f1(X) = A·X + [alpha; 0] where A = 1/2 * [[-1, -1], [0, 1]]
      nx = -(p.x + p.y) / 2 + alpha;
      ny = p.y / 2;
    } else if (funcIdx === 1) {
      // f2(X) = A·X + [0.5; -0.5]
      nx = -(p.x + p.y) / 2 + 0.5;
      ny = p.y / 2 - 0.5;
    } else if (funcIdx === 2) {
      // f3(X) = A·X + [0; -0.5]
      nx = -(p.x + p.y) / 2;
      ny = p.y / 2 - 0.5;
    } else {
      // f4(X) = -A·X + [0.5 + beta; -0.5] where -A = 1/2 * [[1, 1], [0, -1]]
      nx = (p.x + p.y) / 2 + 0.5 + beta;
      ny = -p.y / 2 - 0.5;
    }

    return { x: nx, y: ny };
  }, [alpha, beta]);

  // Compute polygons up to current step
  const getPolygonsForStep = useCallback((targetStep: number): Polygon[] => {
    let currentPolygons: Polygon[] = [{ vertices: initialVertices, functionIndex: 0 }];

    for (let s = 0; s < targetStep; s++) {
      const nextPolygons: Polygon[] = [];
      for (const poly of currentPolygons) {
        // Apply all 4 functions to this polygon
        for (let fIdx = 0; fIdx < 4; fIdx++) {
          const newVertices = poly.vertices.map((v) => applyTransform(v, fIdx));
          nextPolygons.push({ vertices: newVertices, functionIndex: fIdx });
        }
      }
      currentPolygons = nextPolygons;
    }

    return currentPolygons;
  }, [alpha, beta, applyTransform]);

  // Render polygons on canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const { zoom, panX, panY, showGrid } = renderOptions;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const baseScale = Math.min(width, height) * 0.28;
    const scale = baseScale * zoom;
    const offsetX = width / 2 + panX;
    const offsetY = height / 2 + panY;

    // Draw Grid if enabled
    if (showGrid) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.font = '11px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)';

      let gridStep = 0.5;
      if (scale < 80) gridStep = 1.0;
      if (scale > 350) gridStep = 0.25;

      const minX = -offsetX / scale;
      const maxX = (width - offsetX) / scale;
      const minY = (offsetY - height) / scale;
      const maxY = offsetY / scale;

      const startX = Math.floor(minX / gridStep) * gridStep;
      for (let x = startX; x <= maxX; x += gridStep) {
        const cx = offsetX + x * scale;
        if (cx >= 0 && cx <= width) {
          ctx.beginPath();
          ctx.moveTo(cx, 0);
          ctx.lineTo(cx, height);
          ctx.stroke();
          const labelY = Math.min(Math.max(offsetY, 25), height - 25);
          if (Math.abs(x) > 0.001) {
            ctx.fillText(x.toFixed(1), cx - 12, labelY + 16);
          }
        }
      }

      const startY = Math.floor(minY / gridStep) * gridStep;
      for (let y = startY; y <= maxY; y += gridStep) {
        const cy = offsetY - y * scale;
        if (cy >= 0 && cy <= height) {
          ctx.beginPath();
          ctx.moveTo(0, cy);
          ctx.lineTo(width, cy);
          ctx.stroke();
          const labelX = Math.min(Math.max(offsetX, 30), width - 40);
          if (Math.abs(y) > 0.001) {
            ctx.fillText(y.toFixed(1), labelX - 35, cy + 4);
          }
        }
      }

      // Main Axes
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
      ctx.lineWidth = 1.5;
      if (offsetX >= 0 && offsetX <= width) {
        ctx.beginPath();
        ctx.moveTo(offsetX, 0);
        ctx.lineTo(offsetX, height);
        ctx.stroke();
      }
      if (offsetY >= 0 && offsetY <= height) {
        ctx.beginPath();
        ctx.moveTo(0, offsetY);
        ctx.lineTo(width, offsetY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Get polygons for current step
    const polygons = getPolygonsForStep(step);

    // Draw each polygon
    polygons.forEach((poly) => {
      const cConfig = COLORS[poly.functionIndex % 4];
      ctx.beginPath();
      poly.vertices.forEach((v, vIdx) => {
        const cx = offsetX + v.x * scale;
        const cy = offsetY - v.y * scale;
        if (vIdx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.closePath();

      if (fillPolygons && step <= 4) {
        ctx.fillStyle = cConfig.fill;
        ctx.fill();
      }

      ctx.strokeStyle = cConfig.stroke;
      ctx.lineWidth = step > 4 ? 1 : 1.5;
      ctx.stroke();
    });

    // Draw initial ABCD vertex labels if step === 0
    if (step === 0) {
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#00d4ff';
      const labels = ['A(-0.5, 0)', 'B(0.5, 0)', 'D(1, -1)', 'C(0, -1)'];
      initialVertices.forEach((v, idx) => {
        const cx = offsetX + v.x * scale;
        const cy = offsetY - v.y * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00d4ff';
        ctx.fill();
        ctx.fillText(labels[idx], cx + 8, cy - 8);
      });
    }
  }, [step, fillPolygons, getPolygonsForStep, renderOptions, alpha, beta]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Auto-play step animation
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= 6) {
          setIsPlaying(false);
          return 6;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 shadow-2xl overflow-hidden" ref={containerRef}>
      {/* Top Toolbar */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => setFillPolygons(!fillPolygons)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            fillPolygons ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 text-slate-300'
          }`}
        >
          {fillPolygons ? 'Filled Mode' : 'Wireframe'}
        </button>
        <button
          onClick={() => setRenderOptions((prev) => ({ ...prev, showGrid: !prev.showGrid }))}
          className={`p-2 rounded-lg transition-colors ${
            renderOptions.showGrid ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'hover:bg-slate-800 text-slate-300'
          }`}
          title="Toggle Grid"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRenderOptions((prev) => ({ ...prev, zoom: Math.min(20, prev.zoom * 1.2) }))}
          className="p-2 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRenderOptions((prev) => ({ ...prev, zoom: Math.max(0.2, prev.zoom / 1.2) }))}
          className="p-2 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="rounded-xl shadow-2xl border border-cyan-500/20 bg-black"
      />

      {/* Bottom Step Control Toolbar */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-xl border border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            Step {step} / 6 <span className="text-slate-400 font-normal">({Math.pow(4, step)} polygons)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setStep(0); setIsPlaying(false); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Reset to Step 0 (ABCD)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setStep((s) => Math.max(0, s - 1)); setIsPlaying(false); }}
            disabled={step === 0}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Auto Play'}
          </button>
          <button
            onClick={() => { setStep((s) => Math.min(6, s + 1)); setIsPlaying(false); }}
            disabled={step >= 6}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
