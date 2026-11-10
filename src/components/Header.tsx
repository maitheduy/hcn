import React from 'react';
import { Sparkles, Download, RotateCcw, HelpCircle, Play, Pause, Layers, Eye } from 'lucide-react';
import { IFSParamPreset } from '../types';
import { PRESETS } from '../utils/presets';

interface HeaderProps {
  currentPreset: IFSParamPreset;
  onSelectPreset: (preset: IFSParamPreset) => void;
  onResetView: () => void;
  onExport: () => void;
  onOpenHelp: () => void;
  isAnimating: boolean;
  onToggleAnimation: () => void;
  pointCount: number;
  renderTime: number;
  fps: number;
  viewMode: 'chaos' | 'polygon';
  onToggleViewMode: (mode: 'chaos' | 'polygon') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  onResetView,
  onExport,
  onOpenHelp,
  isAnimating,
  onToggleAnimation,
  pointCount,
  renderTime,
  fps,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
              IFS Chaos Game Studio
            </h1>
            <p className="text-xs text-slate-400">High-Performance Fractal Attractor & Affine Generator</p>
          </div>
        </div>

        {/* View Mode & Presets */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onToggleViewMode('chaos')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'chaos'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chaos Game (Points)
            </button>
            <button
              onClick={() => onToggleViewMode('polygon')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'polygon'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Step-by-Step (ABCD)
            </button>
          </div>

          {viewMode === 'chaos' && (
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-sm text-slate-300">
              <Layers className="w-4 h-4 text-cyan-400" />
              <select
                value={currentPreset.id}
                onChange={(e) => {
                  const found = PRESETS.find((p) => p.id === e.target.value);
                  if (found) onSelectPreset(found);
                }}
                className="bg-transparent text-cyan-300 font-medium focus:outline-none cursor-pointer"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {viewMode === 'chaos' && (
            <button
              onClick={onToggleAnimation}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md ${
                isAnimating
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
              title="Morph Alpha & Beta over time"
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAnimating ? 'Stop Morph' : 'Morph Animation'}
            </button>
          )}

          <button
            onClick={onResetView}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            title="Reset Zoom and Pan"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            Reset View
          </button>

          {viewMode === 'chaos' && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
              title="Export High-Res PNG"
            >
              <Download className="w-4 h-4" />
              Export Art
            </button>
          )}

          <button
            onClick={onOpenHelp}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Math & Help Guide"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
