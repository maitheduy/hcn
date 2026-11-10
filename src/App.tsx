import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { CanvasRenderer } from './components/CanvasRenderer';
import { PolygonStepView } from './components/PolygonStepView';
import { HelpModal } from './components/HelpModal';
import { IFSParamPreset, RenderOptions, AffineTransform } from './types';
import { PRESETS } from './utils/presets';

export default function App() {
  const [currentPreset, setCurrentPreset] = useState<IFSParamPreset>(PRESETS[0]);
  const [alpha, setAlpha] = useState<number>(PRESETS[0].alpha);
  const [beta, setBeta] = useState<number>(PRESETS[0].beta);
  const [transforms, setTransforms] = useState<AffineTransform[]>(PRESETS[0].transforms);
  const [viewMode, setViewMode] = useState<'chaos' | 'polygon'>('chaos');

  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    iterations: 200000,
    pointSize: 1.0,
    colorPalette: 'cyberpunk',
    useFunctionColors: true,
    gamma: 1.2,
    zoom: 1.0,
    panX: currentPreset.defaultOffsetX,
    panY: currentPreset.defaultOffsetY,
    rotation: 0,
    showGrid: true,
  });

  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1.0);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [exportTrigger, setExportTrigger] = useState<boolean>(false);

  const [stats, setStats] = useState({
    pointCount: 200000,
    renderTime: 0,
    fps: 60,
  });

  // Handle Preset Selection
  const handleSelectPreset = (preset: IFSParamPreset) => {
    setCurrentPreset(preset);
    setAlpha(preset.alpha);
    setBeta(preset.beta);
    setTransforms(preset.transforms);
    setRenderOptions((prev) => ({
      ...prev,
      zoom: 1.0,
      panX: preset.defaultOffsetX,
      panY: preset.defaultOffsetY,
    }));
    setIsAnimating(false);
  };

  const handleResetView = () => {
    setRenderOptions((prev) => ({
      ...prev,
      zoom: 1.0,
      panX: currentPreset.defaultOffsetX,
      panY: currentPreset.defaultOffsetY,
    }));
  };

  // Animation loop for morphing alpha and beta
  useEffect(() => {
    if (!isAnimating) return;
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      angle += 0.02 * animationSpeed;
      const newAlpha = Math.sin(angle) * 1.5;
      const newBeta = Math.cos(angle * 0.7) * 1.5;
      setAlpha(newAlpha);
      setBeta(newBeta);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAnimating, animationSpeed]);

  const handleUpdateStats = useCallback((points: number, timeMs: number, fps: number) => {
    setStats({ pointCount: points, renderTime: timeMs, fps });
  }, []);

  const handleRedraw = () => {
    setRenderOptions({ ...renderOptions });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      <Header
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        onResetView={handleResetView}
        onExport={() => setExportTrigger((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
        isAnimating={isAnimating}
        onToggleAnimation={() => setIsAnimating(!isAnimating)}
        pointCount={stats.pointCount}
        renderTime={stats.renderTime}
        fps={stats.fps}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4 h-[75vh] flex flex-col">
          <ControlPanel
            alpha={alpha}
            setAlpha={setAlpha}
            beta={beta}
            setBeta={setBeta}
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            renderOptions={renderOptions}
            setRenderOptions={setRenderOptions}
            transforms={transforms}
            setTransforms={setTransforms}
            isAnimating={isAnimating}
            setIsAnimating={setIsAnimating}
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
            onRedraw={handleRedraw}
          />
        </div>

        <div className="lg:col-span-8 h-[75vh] flex flex-col">
          {viewMode === 'chaos' ? (
            <CanvasRenderer
              alpha={alpha}
              beta={beta}
              transforms={transforms}
              renderOptions={renderOptions}
              setRenderOptions={setRenderOptions}
              onUpdateStats={handleUpdateStats}
              exportTrigger={exportTrigger}
            />
          ) : (
            <PolygonStepView
              alpha={alpha}
              beta={beta}
              transforms={transforms}
              renderOptions={renderOptions}
              setRenderOptions={setRenderOptions}
            />
          )}
        </div>
      </main>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
