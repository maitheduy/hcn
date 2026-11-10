export interface AffineTransform {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  p: number; // Probability weight
  color?: { r: number; g: number; b: number };
  name?: string;
}

export interface IFSParamPreset {
  id: string;
  name: string;
  description: string;
  alpha: number;
  beta: number;
  transforms: AffineTransform[];
  defaultScale: number;
  defaultOffsetX: number;
  defaultOffsetY: number;
}

export type ColorPalette = 'cyberpunk' | 'emerald' | 'fire' | 'galaxy' | 'gold' | 'rainbow' | 'monochrome';

export interface RenderOptions {
  iterations: number;
  pointSize: number;
  colorPalette: ColorPalette;
  useFunctionColors: boolean;
  gamma: number; // For density brightness
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  showGrid: boolean;
}
