export interface LatoTheme {
  id: string;
  name: string;
  description: string;
  bgGradient: string;
  canvasBg: string;
  ball1: {
    color: string;
    glow: string;
    specular: string;
    ring: string;
  };
  ball2: {
    color: string;
    glow: string;
    specular: string;
    ring: string;
  };
  stringColor: string;
  stringGlow: string;
  ringColor: string;
  accentColor: string;
  sparkColors: string[];
}

export const LATO_THEMES: LatoTheme[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Energi tinggi warna Neon Pink & Electric Cyan',
    bgGradient: 'from-slate-950 via-purple-950/40 to-slate-950',
    canvasBg: '#090814',
    ball1: {
      color: '#ff007f', // Vivid Neon Pink
      glow: 'rgba(255, 0, 127, 0.65)',
      specular: '#ffb3d9',
      ring: '#ff3399',
    },
    ball2: {
      color: '#00f0ff', // Vivid Neon Cyan
      glow: 'rgba(0, 240, 255, 0.65)',
      specular: '#cbfaff',
      ring: '#33f3ff',
    },
    stringColor: 'rgba(255, 255, 255, 0.85)',
    stringGlow: 'rgba(0, 240, 255, 0.4)',
    ringColor: '#fbbf24',
    accentColor: '#ff007f',
    sparkColors: ['#ff007f', '#00f0ff', '#ffe600', '#ffffff'],
  },
  {
    id: 'sunset',
    name: 'Sunset Vibes',
    description: 'Nuansa senja hangat Tangerine & Violet Sky',
    bgGradient: 'from-slate-950 via-rose-950/40 to-amber-950/20',
    canvasBg: '#0d0612',
    ball1: {
      color: '#ff5e36', // Warm Orange Sunset
      glow: 'rgba(255, 94, 54, 0.65)',
      specular: '#ffd0c4',
      ring: '#ff7754',
    },
    ball2: {
      color: '#a855f7', // Vivid Purple
      glow: 'rgba(168, 85, 247, 0.65)',
      specular: '#ebd5ff',
      ring: '#b975f8',
    },
    stringColor: 'rgba(255, 225, 210, 0.85)',
    stringGlow: 'rgba(255, 94, 54, 0.4)',
    ringColor: '#f59e0b',
    accentColor: '#ff5e36',
    sparkColors: ['#ff5e36', '#fbbf24', '#a855f7', '#fff1f2'],
  },
  {
    id: 'matrix',
    name: 'Matrix Hacker',
    description: 'Tema siber terminal Matrix Lime & Toxic Emerald',
    bgGradient: 'from-black via-emerald-950/30 to-black',
    canvasBg: '#030d07',
    ball1: {
      color: '#10b981', // Emerald
      glow: 'rgba(16, 185, 129, 0.65)',
      specular: '#a7f3d0',
      ring: '#34d399',
    },
    ball2: {
      color: '#22c55e', // Toxic Lime
      glow: 'rgba(34, 197, 94, 0.65)',
      specular: '#bbf7d0',
      ring: '#4ade80',
    },
    stringColor: 'rgba(187, 247, 208, 0.85)',
    stringGlow: 'rgba(34, 197, 94, 0.4)',
    ringColor: '#86efac',
    accentColor: '#22c55e',
    sparkColors: ['#22c55e', '#10b981', '#a7f3d0', '#ffffff'],
  },
  {
    id: 'synthwave',
    name: 'Tokyo Synthwave',
    description: 'Gaya retro 80-an Electric Lavender & Sunburst Yellow',
    bgGradient: 'from-slate-950 via-fuchsia-950/35 to-indigo-950/40',
    canvasBg: '#0c0717',
    ball1: {
      color: '#d946ef', // Fuchsia
      glow: 'rgba(217, 70, 239, 0.65)',
      specular: '#f5d0fe',
      ring: '#e879f9',
    },
    ball2: {
      color: '#eab308', // Solar Gold
      glow: 'rgba(234, 179, 8, 0.65)',
      specular: '#fef08a',
      ring: '#facc15',
    },
    stringColor: 'rgba(245, 208, 254, 0.85)',
    stringGlow: 'rgba(217, 70, 239, 0.4)',
    ringColor: '#38bdf8',
    accentColor: '#d946ef',
    sparkColors: ['#d946ef', '#eab308', '#38bdf8', '#ffffff'],
  },
  {
    id: 'cosmic',
    name: 'Cosmic Nebula',
    description: 'Eksplorasi antariksa Galaxy Blue & Starlight Silver',
    bgGradient: 'from-slate-950 via-blue-950/40 to-slate-950',
    canvasBg: '#060a14',
    ball1: {
      color: '#3b82f6', // Bright Blue
      glow: 'rgba(59, 130, 246, 0.65)',
      specular: '#bfdbfe',
      ring: '#60a5fa',
    },
    ball2: {
      color: '#ec4899', // Hot Pink Stellar
      glow: 'rgba(236, 72, 153, 0.65)',
      specular: '#fbcfe8',
      ring: '#f472b6',
    },
    stringColor: 'rgba(224, 231, 255, 0.85)',
    stringGlow: 'rgba(59, 130, 246, 0.4)',
    ringColor: '#c084fc',
    accentColor: '#3b82f6',
    sparkColors: ['#3b82f6', '#ec4899', '#c084fc', '#ffffff'],
  }
];

export function getThemeByScore(score: number, shiftThreshold: number = 15): LatoTheme {
  const index = Math.floor(score / shiftThreshold) % LATO_THEMES.length;
  return LATO_THEMES[index];
}
