import React, { useState } from 'react';
import { Sliders, Palette, Edit3, PlayCircle, Layers, Plus, Trash2, RefreshCw, Atom } from 'lucide-react';
import { IFSParamPreset, RenderOptions, AffineTransform, ColorPalette } from '../types';
import { COLOR_PALETTES, PRESETS } from '../utils/presets';

interface ControlPanelProps {
  alpha: number;
  setAlpha: (val: number) => void;
  beta: number;
  setBeta: (val: number) => void;
  currentPreset: IFSParamPreset;
  onSelectPreset: (preset: IFSParamPreset) => void;
  renderOptions: RenderOptions;
  setRenderOptions: React.Dispatch<React.SetStateAction<RenderOptions>>;
  transforms: AffineTransform[];
  setTransforms: React.Dispatch<React.SetStateAction<AffineTransform[]>>;
  isAnimating: boolean;
  setIsAnimating: (val: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (val: number) => void;
  onRedraw: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  alpha,
  setAlpha,
  beta,
  setBeta,
  currentPreset,
  onSelectPreset,
  renderOptions,
  setRenderOptions,
  transforms,
  setTransforms,
  isAnimating,
  setIsAnimating,
  animationSpeed,
  setAnimationSpeed,
  onRedraw,
}) => {
  const [activeTab, setActiveTab] = useState<'params' | 'presets' | 'color' | 'editor' | 'animation'>('params');

  const updateTransform = (index: number, field: keyof AffineTransform, value: number) => {
    const updated = [...transforms];
    updated[index] = { ...updated[index], [field]: value };
    setTransforms(updated);
  };

  const addTransform = () => {
    setTransforms([
      ...transforms,
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0, p: 1 / (transforms.length + 1), name: `f_${transforms.length + 1}` }
    ]);
  };

  const removeTransform = (index: number) => {
    if (transforms.length <= 1) return;
    const updated = transforms.filter((_, i) => i !== index);
    const pVal = 1 / updated.length;
    const normalized = updated.map(t => ({ ...t, p: pVal }));
    setTransforms(normalized);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-full shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Tabs Header */}
      <div className="grid grid-cols-5 bg-slate-950/80 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('params')}
          className={`py-3 flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'params'
              ? 'text-cyan-400 bg-slate-900 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Params</span>
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`py-3 flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'presets'
              ? 'text-cyan-400 bg-slate-900 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Presets</span>
        </button>
        <button
          onClick={() => setActiveTab('color')}
          className={`py-3 flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'color'
              ? 'text-cyan-400 bg-slate-900 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Colors</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`py-3 flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'editor'
              ? 'text-cyan-400 bg-slate-900 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>IFS Editor</span>
        </button>
        <button
          onClick={() => setActiveTab('animation')}
          className={`py-3 flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'animation'
              ? 'text-cyan-400 bg-slate-900 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Motion</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        {activeTab === 'params' && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-cyan-300">Alpha Parameter (α)</label>
                <span className="font-mono text-sm text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  {alpha.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.01"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-cyan-300">Beta Parameter (β)</label>
                <span className="font-mono text-sm text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  {beta.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.01"
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-cyan-300">Point Iterations</label>
                <span className="font-mono text-sm text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  {renderOptions.iterations.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="2000000"
                step="50000"
                value={renderOptions.iterations}
                onChange={(e) => setRenderOptions({ ...renderOptions, iterations: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-cyan-300">Point Size</label>
                <span className="font-mono text-sm text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  {renderOptions.pointSize.toFixed(1)} px
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={renderOptions.pointSize}
                onChange={(e) => setRenderOptions({ ...renderOptions, pointSize: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-cyan-300">Brightness / Gamma</label>
                <span className="font-mono text-sm text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                  {renderOptions.gamma.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={renderOptions.gamma}
                onChange={(e) => setRenderOptions({ ...renderOptions, gamma: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={onRedraw}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Re-render Attractor
            </button>

            {/* LIVE IFS CONTRACTION FUNCTIONS BOX (Below Sliders) */}
            <div className="mt-6 p-4 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-3 shadow-inner">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-cyan-400" />
                Khung hiện hệ hàm co IFS (Live Vector tịnh tiến)
              </h4>
              <p className="text-[11px] text-slate-400">
                Preset: <span className="text-cyan-300 font-semibold">{currentPreset.name}</span>
              </p>

              {currentPreset.id === 'quad-custom' ? (
                <div className="space-y-1.5 font-mono text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-rose-400 font-semibold">f₁(X) = A·X + [{alpha.toFixed(2)}; 0]</span>
                    <span className="text-[10px] text-slate-500">Đỏ hồng</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-amber-400 font-semibold">f₂(X) = A·X + [0.50; -0.50]</span>
                    <span className="text-[10px] text-slate-500">Vàng cam</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-emerald-400 font-semibold">f₃(X) = A·X + [0.00; -0.50]</span>
                    <span className="text-[10px] text-slate-500">Xanh lá</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-cyan-400 font-semibold">f₄(X) = -A·X + [{(0.5 + beta).toFixed(2)}; -0.50]</span>
                    <span className="text-[10px] text-slate-500">Cyan (β={beta.toFixed(2)})</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
                  {transforms.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-800/60 last:border-0">
                      <span className="text-cyan-300 font-semibold">
                        {t.name || `f_${idx + 1}`}: [e={t.e.toFixed(2)}, f={t.f.toFixed(2)}]
                      </span>
                      <span className="text-[10px] text-slate-400">p={(t.p * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-slate-400 italic">
                * Khi thay đổi slider Alpha (α) và Beta (β), vector tịnh tiến ở hàm f₁ và f₄ cập nhật trực tiếp theo thời gian thực.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Choose Fractal Preset</h3>
            {PRESETS.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPreset(p)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  currentPreset.id === p.id
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                }`}
              >
                <div className="font-semibold text-white text-sm flex items-center justify-between">
                  <span>{p.name}</span>
                  {currentPreset.id === p.id && <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">Active</span>}
                </div>
                <p className="text-xs text-slate-400 mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'color' && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-cyan-300 block mb-3">Color Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRenderOptions({ ...renderOptions, useFunctionColors: true })}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    renderOptions.useFunctionColors
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  By IFS Function
                </button>
                <button
                  onClick={() => setRenderOptions({ ...renderOptions, useFunctionColors: false })}
                  className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                    !renderOptions.useFunctionColors
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  Density Gradient
                </button>
              </div>
            </div>

            {!renderOptions.useFunctionColors && (
              <div>
                <label className="text-sm font-semibold text-cyan-300 block mb-3">Color Palette</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {Object.entries(COLOR_PALETTES).map(([key, pal]) => (
                    <button
                      key={key}
                      onClick={() => setRenderOptions({ ...renderOptions, colorPalette: key as ColorPalette })}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                        renderOptions.colorPalette === key
                          ? 'bg-cyan-950/60 border-cyan-400 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{pal.name}</span>
                      <div className="flex gap-1">
                        {[0, 0.3, 0.6, 1].map((t) => {
                          const c = pal.getGradientColor(t);
                          return (
                            <div
                              key={t}
                              className="w-4 h-4 rounded-full border border-black/30"
                              style={{ backgroundColor: `rgb(${c.r}, ${c.g}, ${c.b})` }}
                            />
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Affine Transforms ({transforms.length})</h3>
              <button
                onClick={addTransform}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Function
              </button>
            </div>

            <div className="space-y-3">
              {transforms.map((t, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">{t.name || `f_${idx + 1}`}</span>
                    {transforms.length > 1 && (
                      <button
                        onClick={() => removeTransform(idx)}
                        className="text-red-400 hover:text-red-300 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <label className="text-[10px] text-slate-400 block">a</label>
                      <input
                        type="number"
                        step="0.01"
                        value={t.a}
                        onChange={(e) => updateTransform(idx, 'a', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">b</label>
                      <input
                        type="number"
                        step="0.01"
                        value={t.b}
                        onChange={(e) => updateTransform(idx, 'b', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">e (tx)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={t.e}
                        onChange={(e) => updateTransform(idx, 'e', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">c</label>
                      <input
                        type="number"
                        step="0.01"
                        value={t.c}
                        onChange={(e) => updateTransform(idx, 'c', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">d</label>
                      <input
                        type="number"
                        step="0.01"
                        value={t.d}
                        onChange={(e) => updateTransform(idx, 'd', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">f (ty)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={t.f}
                        onChange={(e) => updateTransform(idx, 'f', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'animation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-cyan-300 mb-2">Morphing Animation Studio</h3>
              <p className="text-xs text-slate-400">
                Smoothly oscillate alpha and beta parameters to generate mesmerizing morphing fractal animations.
              </p>
            </div>

            <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-sm font-semibold text-white block">Morph State</span>
                <span className="text-xs text-slate-400">{isAnimating ? 'Running live animation...' : 'Paused'}</span>
              </div>
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isAnimating
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {isAnimating ? 'Stop Animation' : 'Start Morphing'}
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-300">Animation Speed</label>
                <span className="font-mono text-sm text-cyan-400">{animationSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
