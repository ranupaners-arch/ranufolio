import * as simple from 'simple-icons';

export type SimpleIcon = { title: string; path: string; hex: string };

// Diakses lewat nama (string) supaya nama yang tidak ada di versi paket ini
// tidak merusak build: ikon yang hilang cukup diganti huruf awal.
const lib = simple as unknown as Record<string, SimpleIcon | undefined>;

export function getIcon(names?: readonly string[]): SimpleIcon | undefined {
  for (const n of names ?? []) {
    const icon = lib[n];
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
