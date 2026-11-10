import React from 'react';
import { X, BookOpen, Atom, Cpu } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">IFS Chaos Game & Math Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-cyan-300 flex items-center gap-2">
              <Atom className="w-4 h-4" />
              What is an Iterated Function System (IFS)?
            </h3>
            <p>
              An Iterated Function System is a method of constructing fractals. The attractor is the unique non-empty compact set A that is the fixed point of a set of contraction mappings f₁, f₂, ..., fₙ.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-cyan-300 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              The Chaos Game Algorithm
            </h3>
            <p>
              The Chaos Game generates the attractor by starting with a random point and repeatedly applying a randomly chosen function fᵢ from the IFS system. With each step, the point is transformed and plotted. After skipping initial transient steps, the points converge onto the fractal attractor.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 font-mono text-xs">
            <div className="text-cyan-400 font-bold">Affine Transformation Equation:</div>
            <div className="text-slate-300">
              X<sub>n+1</sub> = a·X<sub>n</sub> + b·Y<sub>n</sub> + e<br />
              Y<sub>n+1</sub> = c·X<sub>n</sub> + d·Y<sub>n</sub> + f
            </div>
            <div className="text-slate-400 pt-2 border-t border-slate-800">
              By adjusting parameters like <span className="text-cyan-300">α (Alpha)</span> and <span className="text-cyan-300">β (Beta)</span> in the translation and matrix coefficients, you morph the geometric topology in real time.
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-cyan-300">Tips for Best Experience</h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>Use the mouse wheel to zoom in and out of microscopic fractal details.</li>
              <li>Click and drag on the canvas to pan across the attractor plane.</li>
              <li>Toggle <span className="text-cyan-300">Motion Animation</span> to automatically oscillate α and β parameters.</li>
              <li>Switch color palettes between Cyberpunk Neon, Solar Fire, and Emerald Matrix for stunning visual aesthetics.</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            Got it, let's explore!
          </button>
        </div>
      </div>
    </div>
  );
};
