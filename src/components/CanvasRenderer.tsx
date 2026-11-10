import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RenderOptions, AffineTransform } from '../types';
import { COLOR_PALETTES } from '../utils/presets';
import { ZoomIn, ZoomOut, RotateCcw, Grid } from 'lucide-react';

interface CanvasRendererProps {
  alpha: number;
  beta: number;
  transforms: AffineTransform[];
  renderOptions: RenderOptions;
  setRenderOptions: React.Dispatch<React.SetStateAction<RenderOptions>>;
  onUpdateStats: (points: number, timeMs: number, fps: number) => void;
  exportTrigger: boolean;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  alpha,
  beta,
  transforms,
  renderOptions,
  setRenderOptions,
  onUpdateStats,
  exportTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });

  // Handle responsive canvas sizing based on container
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

  // Draw coordinate grid and labels (-1, -0.5, 0, 0.5, 1, etc.)
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number, offsetX: number, offsetY: number) => {
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = '11px monospace';
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)'; // subtle grid line

    let step = 0.5;
    if (scale < 80) step = 1.0;
    if (scale > 350) step = 0.25;

    const minX = -offsetX / scale;
    const maxX = (width - offsetX) / scale;
    const minY = (offsetY - height) / scale;
    const maxY = offsetY / scale;

    // Draw vertical grid lines & X-axis labels
    const startX = Math.floor(minX / step) * step;
    for (let x = startX; x <= maxX; x += step) {
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

    // Draw horizontal grid lines & Y-axis labels
    const startY = Math.floor(minY / step) * step;
    for (let y = startY; y <= maxY; y += step) {
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

    // Main Axes X=0 and Y=0
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
    ctx.lineWidth = 1.5;

    const originX = offsetX;
    if (originX >= 0 && originX <= width) {
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();
    }

    const originY = offsetY;
    if (originY >= 0 && originY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();
    }

    if (originX >= 10 && originX <= width - 10 && originY >= 15 && originY <= height - 10) {
      ctx.fillStyle = '#00d4ff';
      ctx.fillText('0.0', originX + 6, originY + 15);
    }

    ctx.restore();
  };

  // Main rendering engine with chunked requestAnimationFrame for 60fps responsiveness
  const renderAttractor = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();
    const { width, height } = canvas;
    const { iterations, pointSize, colorPalette, useFunctionColors, gamma, zoom, panX, panY, showGrid } = renderOptions;

    // Clear canvas with deep black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Density accumulation buffer for gradient coloring
    const density = new Float32Array(width * height);
    const funcIndexBuffer = new Int32Array(width * height);
    let maxDensity = 1;

    // Scale and center mapping
    const baseScale = Math.min(width, height) * 0.28;
    const scale = baseScale * zoom;
    const offsetX = width / 2 + panX;
    const offsetY = height / 2 + panY;

    // Start with random point
    let x = Math.random() * 2 - 1;
    let y = Math.random() * 2 - 1;

    // Skip transient points
    for (let i = 0; i < 30; i++) {
      let r = Math.random();
      let cumProb = 0;
      let chosenIdx = 0;
      for (let j = 0; j < transforms.length; j++) {
        cumProb += transforms[j].p;
        if (r <= cumProb) {
          chosenIdx = j;
          break;
        }
      }
      const t = transforms[chosenIdx];
      let nx = t.a * x + t.b * y + t.e;
      let ny = t.c * x + t.d * y + t.f;
      if (chosenIdx === 0) nx += alpha;
      if (chosenIdx === 3) nx += beta;
      x = nx;
      y = ny;
    }

    // Main iteration loop
    const batchSize = 50000;
    let plotted = 0;

    const paletteObj = COLOR_PALETTES[colorPalette] || COLOR_PALETTES.cyberpunk;

    const runBatch = () => {
      const limit = Math.min(iterations, plotted + batchSize);
      
      for (let i = plotted; i < limit; i++) {
        let r = Math.random();
        let cumProb = 0;
        let chosenIdx = 0;
        for (let j = 0; j < transforms.length; j++) {
          cumProb += transforms[j].p;
          if (r <= cumProb) {
            chosenIdx = j;
            break;
          }
        }
        const t = transforms[chosenIdx];
        let nx = t.a * x + t.b * y + t.e;
        let ny = t.c * x + t.d * y + t.f;
        if (chosenIdx === 0) nx += alpha;
        if (chosenIdx === 3) nx += beta;
        x = nx;
        y = ny;

        // Convert to canvas coordinates
        const cx = Math.floor(offsetX + x * scale);
        const cy = Math.floor(offsetY - y * scale);

        if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
          const idx = cy * width + cx;
          density[idx] += 1;
          if (density[idx] > maxDensity) maxDensity = density[idx];
          funcIndexBuffer[idx] = chosenIdx;

          if (pointSize > 1) {
            const pInt = Math.round(pointSize);
            for (let dx = -pInt; dx <= pInt; dx++) {
              for (let dy = -pInt; dy <= pInt; dy++) {
                const nnx = cx + dx;
                const nny = cy + dy;
                if (nnx >= 0 && nnx < width && nny >= 0 && nny < height) {
                  const nidx = nny * width + nnx;
                  density[nidx] += 0.3;
                  if (density[nidx] > maxDensity) maxDensity = density[nidx];
                }
              }
            }
          }
        }
      }

      plotted = limit;

      if (plotted < iterations) {
        requestAnimationFrame(runBatch);
      } else {
        const logMax = Math.log(maxDensity + 1);

        for (let py = 0; py < height; py++) {
          for (let px = 0; px < width; px++) {
            const index = py * width + px;
            const d = density[index];
            if (d > 0) {
              const pixelIdx = index * 4;
              let color = { r: 0, g: 212, b: 255 };

              if (useFunctionColors) {
                const fIdx = funcIndexBuffer[index];
                const tf = transforms[fIdx];
                if (tf && tf.color) {
                  color = tf.color;
                }
                const intensity = Math.min(1, Math.pow(d / (maxDensity * 0.5), 1 / gamma));
                data[pixelIdx] = Math.floor(color.r * intensity);
                data[pixelIdx + 1] = Math.floor(color.g * intensity);
                data[pixelIdx + 2] = Math.floor(color.b * intensity);
                data[pixelIdx + 3] = 255;
              } else {
                const tNorm = Math.min(1, Math.pow(Math.log(d + 1) / logMax, 1 / gamma));
                color = paletteObj.getGradientColor(tNorm);
                data[pixelIdx] = color.r;
                data[pixelIdx + 1] = color.g;
                data[pixelIdx + 2] = color.b;
                data[pixelIdx + 3] = 255;
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Draw coordinate grid if enabled
        if (showGrid) {
          drawGrid(ctx, width, height, scale, offsetX, offsetY);
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        onUpdateStats(iterations, duration, 60);
      }
    };

    runBatch();
  }, [alpha, beta, transforms, renderOptions, onUpdateStats]);

  useEffect(() => {
    renderAttractor();
  }, [renderAttractor]);

  // Export handle
  useEffect(() => {
    if (exportTrigger && canvasRef.current) {
      const link = document.createElement('a');
      link.download = `ifs-fractal-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  }, [exportTrigger]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });
    setRenderOptions((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setRenderOptions((prev) => ({
      ...prev,
      zoom: Math.max(0.2, Math.min(20, prev.zoom * zoomFactor)),
    }));
  };

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 shadow-2xl overflow-hidden" ref={containerRef}>
      {/* Canvas Header Toolbar */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl shadow-lg">
        <button
          onClick={() => setRenderOptions((prev) => ({ ...prev, showGrid: !prev.showGrid }))}
          className={`p-2 rounded-lg transition-colors ${
            renderOptions.showGrid
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
              : 'hover:bg-slate-800 text-slate-300 hover:text-cyan-400'
          }`}
          title="Toggle Coordinate Grid"
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
        <button
          onClick={() => setRenderOptions((prev) => ({ ...prev, zoom: 1, panX: 0, panY: 0 }))}
          className="p-2 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-lg transition-colors"
          title="Reset Zoom & Pan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="rounded-xl cursor-grab active:cursor-grabbing shadow-2xl border border-cyan-500/20 bg-black"
      />

      <div className="absolute bottom-6 left-6 text-xs font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none">
        Zoom: {(renderOptions.zoom * 100).toFixed(0)}% | Drag to Pan • Scroll to Zoom
      </div>
    </div>
  );
};
