import { IFSParamPreset } from '../types';

export const PRESETS: IFSParamPreset[] = [
  {
    id: 'quad-custom',
    name: 'Quad Chaos Attractor (User Custom)',
    description: 'The parameterized 4-function IFS system with adjustable alpha and beta parameters.',
    alpha: 0,
    beta: 0,
    defaultScale: 220,
    defaultOffsetX: 0,
    defaultOffsetY: 0,
    transforms: [
      // f1
      { a: -0.5, b: -0.5, c: 0, d: 0.5, e: 0, f: 0, p: 0.25, color: { r: 255, g: 51, b: 102 }, name: 'f₁ (Red Pink)' },
      // f2
      { a: -0.5, b: -0.5, c: 0, d: 0.5, e: 0.5, f: -0.5, p: 0.25, color: { r: 255, g: 204, b: 0 }, name: 'f₂ (Gold Orange)' },
      // f3
      { a: -0.5, b: -0.5, c: 0, d: 0.5, e: 0, f: -0.5, p: 0.25, color: { r: 0, g: 255, b: 136 }, name: 'f₃ (Emerald Green)' },
      // f4
      { a: 0.5, b: 0.5, c: 0, d: -0.5, e: 0.5, f: -0.5, p: 0.25, color: { r: 0, g: 212, b: 255 }, name: 'f₄ (Cyan Blue)' },
    ],
  },
  {
    id: 'barnsley-fern',
    name: 'Barnsley Fern',
    description: 'Classic botanical fractal modeling the black spleenwort fern using 4 affine transformations.',
    alpha: 0,
    beta: 0,
    defaultScale: 65,
    defaultOffsetX: 0,
    defaultOffsetY: -240,
    transforms: [
      { a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0, p: 0.01, color: { r: 0, g: 200, b: 80 }, name: 'Stem' },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6, p: 0.85, color: { r: 50, g: 230, b: 100 }, name: 'Successive Leaflets' },
      { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, p: 0.07, color: { r: 100, g: 255, b: 150 }, name: 'Left Leaflet' },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07, color: { r: 150, g: 255, b: 200 }, name: 'Right Leaflet' },
    ],
  },
  {
    id: 'dragon-curve',
    name: 'Heighway Dragon Curve',
    description: 'A self-similar fractal curve that can be constructed by recursive paper folding.',
    alpha: 0,
    beta: 0,
    defaultScale: 280,
    defaultOffsetX: 50,
    defaultOffsetY: 0,
    transforms: [
      { a: 0.5, b: -0.5, c: 0.5, d: 0.5, e: 0, f: 0, p: 0.5, color: { r: 255, g: 100, b: 255 }, name: 'Transform 1' },
      { a: -0.5, b: -0.5, c: 0.5, d: -0.5, e: 1, f: 0, p: 0.5, color: { r: 0, g: 220, b: 255 }, name: 'Transform 2' },
    ],
  },
  {
    id: 'sierpinski-triangle',
    name: 'Sierpinski Gasket',
    description: 'Famous fractal with the overall shape of an equilateral triangle, subdivided recursively.',
    alpha: 0,
    beta: 0,
    defaultScale: 380,
    defaultOffsetX: 0,
    defaultOffsetY: 120,
    transforms: [
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0, p: 0.333, color: { r: 255, g: 50, b: 50 }, name: 'Bottom-Left' },
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0.5, p: 0.333, color: { r: 50, g: 255, b: 50 }, name: 'Top' },
      { a: 0.5, b: 0, c: 0, d: 0.5, e: 1, f: 0, p: 0.334, color: { r: 50, g: 150, b: 255 }, name: 'Bottom-Right' },
    ],
  },
  {
    id: 'spiral-galaxy',
    name: 'Spiral Galaxy Attractor',
    description: 'Mesmerizing multi-branched spiral vortex created by rotation and contraction matrices.',
    alpha: 0,
    beta: 0,
    defaultScale: 180,
    defaultOffsetX: 0,
    defaultOffsetY: 0,
    transforms: [
      { a: 0.8, b: -0.2, c: 0.2, d: 0.8, e: 0.1, f: 0.1, p: 0.33, color: { r: 138, g: 43, b: 226 }, name: 'Spiral Arm 1' },
      { a: 0.7, b: 0.4, c: -0.4, d: 0.7, e: -0.2, f: 0.2, p: 0.33, color: { r: 0, g: 191, b: 255 }, name: 'Spiral Arm 2' },
      { a: 0.6, b: -0.5, c: 0.5, d: 0.6, e: 0.0, f: -0.3, p: 0.34, color: { r: 255, g: 105, b: 180 }, name: 'Spiral Arm 3' },
    ],
  },
];

export const COLOR_PALETTES: Record<string, { name: string; getGradientColor: (t: number) => { r: number; g: number; b: number } }> = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
    getGradientColor: (t: number) => {
      // t from 0 to 1 based on density or depth
      const r = Math.floor(255 * Math.sin(t * Math.PI * 0.5));
      const g = Math.floor(255 * Math.sin(t * Math.PI));
      const b = Math.floor(255 * Math.cos(t * Math.PI * 0.5) + 128);
      return { r: Math.min(255, Math.max(0, r + 50)), g: Math.min(255, Math.max(0, g)), b: Math.min(255, Math.max(0, b)) };
    }
  },
  emerald: {
    name: 'Emerald Matrix',
    getGradientColor: (t: number) => {
      return {
        r: Math.floor(t * 50),
        g: Math.floor(50 + t * 205),
        b: Math.floor(t * 120),
      };
    }
  },
  fire: {
    name: 'Solar Fire',
    getGradientColor: (t: number) => {
      const r = Math.min(255, Math.floor(t * 300));
      const g = Math.min(255, Math.floor(Math.pow(t, 1.5) * 220));
      const b = Math.min(255, Math.floor(Math.pow(t, 3) * 180));
      return { r, g, b };
    }
  },
  galaxy: {
    name: 'Deep Space Nebula',
    getGradientColor: (t: number) => {
      return {
        r: Math.floor(120 + Math.sin(t * Math.PI * 2) * 135),
        g: Math.floor(30 + t * 150),
        b: Math.floor(200 + Math.cos(t * Math.PI) * 55),
      };
    }
  },
  gold: {
    name: 'Royal Gold',
    getGradientColor: (t: number) => {
      return {
        r: Math.min(255, Math.floor(150 + t * 105)),
        g: Math.min(255, Math.floor(100 + t * 155)),
        b: Math.floor(t * 50),
      };
    }
  },
  rainbow: {
    name: 'Rainbow Spectrum',
    getGradientColor: (t: number) => {
      const freq = 2 * Math.PI;
      return {
        r: Math.floor(Math.sin(freq * t + 0) * 127 + 128),
        g: Math.floor(Math.sin(freq * t + 2) * 127 + 128),
        b: Math.floor(Math.sin(freq * t + 4) * 127 + 128),
      };
    }
  },
  monochrome: {
    name: 'Electric Cyan',
    getGradientColor: (t: number) => {
      return {
        r: Math.floor(t * 100),
        g: Math.floor(150 + t * 105),
        b: 255,
      };
    }
  }
};
