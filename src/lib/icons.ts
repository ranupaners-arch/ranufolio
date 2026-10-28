import * as simple from 'simple-icons';

export type SimpleIcon = { title: string; path: string; hex: string };

// Diakses lewat nama (string) supaya nama yang tidak ada di versi paket ini
// tidak merusak build: ikon yang hilang cukup diganti huruf awal.
const lib = simple as unknown as Record<string, SimpleIcon | undefined>;

// simple-icons v14 tidak lagi memuat LinkedIn, jadi path-nya disimpan di sini.
const extra: Record<string, SimpleIcon> = {
  siLinkedin: {
    title: 'LinkedIn',
    hex: '0A66C2',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
};

export function getIcon(names?: readonly string[]): SimpleIcon | undefined {
  for (const n of names ?? []) {
    const icon = extra[n] ?? lib[n];
    if (icon && typeof icon === 'object' && typeof icon.path === 'string') return icon;
  }
  return undefined;
}

function luminance(hex: string): number {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Warna brand, tapi ikon yang terlalu terang untuk latar putih dipakaikan warna ink. */
export function brandFill(icon: SimpleIcon): string {
  return luminance(icon.hex) > 0.45 ? '#0d0d14' : `#${icon.hex}`;
}

const brandOverride: Record<string, string> = {
  Laravel: '#FF2D20', PHP: '#777BB4', 'Node.js': '#339933', Filament: '#E8890C', React: '#0EA5C6',
  JavaScript: '#D9B700', TypeScript: '#3178C6', Tailwind: '#06B6D4', Bootstrap: '#7952B3', MySQL: '#4479A1',
  PostgreSQL: '#4169E1', Redis: '#FF4438', Docker: '#2496ED', Postman: '#FF6C37', 'Android Studio': '#3DDC84',
  'Git & GitHub': '#F05032',
};
const noBrand = new Set(['REST API', 'Next.js', 'Linux VPS', 'GitHub']);

/** Warna ikon saat chip di-hover (Rapi: --brand). undefined = tetap currentColor. */
export function brandHover(name: string, icon?: SimpleIcon): string | undefined {
  if (brandOverride[name]) return brandOverride[name];
  if (noBrand.has(name) || !icon) return undefined;
  const l = luminance(icon.hex);
  return l > 0.03 && l < 0.45 ? `#${icon.hex}` : undefined;
}
