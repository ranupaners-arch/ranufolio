import * as simple from 'simple-icons';

export type SimpleIcon = { title: string; path: string; hex: string; viewBox?: string };

// Diakses lewat nama (string) supaya nama yang tidak ada di versi paket ini
// tidak merusak build: ikon yang hilang cukup diganti huruf awal.
const lib = simple as unknown as Record<string, SimpleIcon | undefined>;

// simple-icons v14 tidak lagi memuat LinkedIn, jadi path-nya disimpan di sini.
const extra: Record<string, SimpleIcon> = {
  siCursor: { title: 'Cursor', hex: '14120B', viewBox: '0 0 475 545', path: 'm466.383 137.073-206.469-119.2034c-6.63-3.8287-14.811-3.8287-21.441 0l-206.4586 119.2034c-5.5734 3.218-9.0144 9.169-9.0144 15.615v240.375c0 6.436 3.441 12.397 9.0144 15.615l206.4686 119.203c6.63 3.829 14.811 3.829 21.441 0l206.468-119.203c5.574-3.218 9.015-9.17 9.015-15.615v-240.375c0-6.436-3.441-12.397-9.015-15.615zm-12.969 25.25-199.316 345.223c-1.347 2.326-4.904 1.376-4.904-1.319v-226.048c0-4.517-2.414-8.695-6.33-10.963l-195.7577-113.019c-2.3263-1.347-1.3764-4.905 1.3182-4.905h398.6305c5.661 0 9.199 6.136 6.368 11.041h-.009z' },
  siGrokbot: { title: 'Grok', hex: '000000', viewBox: '-10 -15 249 249', path: 'M228.541 114.228C228.541 130.133 225.184 145.994 218.738 160.534C212.674 174.217 203.904 186.669 193.065 196.988C155.933 232.34 99.497 238.596 55.5255 212.24C45.097 205.99 35.6851 198.072 27.7451 188.866C19.1926 178.953 12.3686 167.569 7.65781 155.351C2.60712 142.264 0 128.257 0 114.228C0 98.3219 3.35751 82.4611 9.80315 67.9215C15.8672 54.2382 24.6377 41.7862 35.4767 31.4668C72.6081 -3.88483 129.044 -10.1413 173.016 16.2153C183.444 22.4653 192.856 30.3829 200.796 39.5896C209.349 49.5018 216.173 60.8859 220.883 73.1037C225.934 86.1906 228.541 100.198 228.541 114.228Z M118.17 70.73L120.45 71.04L122.59 71.76L124.55 72.87L126.18 74.38L127.42 76.24L128.34 78.29L129.10 80.42L129.83 82.57L130.55 84.72L131.27 86.86L131.97 89.02L132.64 91.19L133.29 93.36L133.91 95.55L134.50 97.74L135.05 99.95L135.36 102.23L135.16 104.55L134.41 106.80L133.11 108.84L131.36 110.51L129.28 111.73L127.01 112.45L124.68 112.65L122.41 112.33L120.31 111.51L118.45 110.26L116.93 108.62L115.81 106.69L115.01 104.57L114.39 102.39L113.80 100.19L113.17 98.01L112.52 95.84L111.85 93.66L111.17 91.51L110.47 89.35L109.75 87.20L108.94 85.09L108.17 82.96L107.64 80.75L107.63 78.44L108.31 76.16L109.61 74.14L111.41 72.51L113.54 71.41L115.84 70.83Z M179.77 59.76L182.04 60.05L184.10 60.75L185.92 61.77L187.55 63.03L188.95 64.50L190.10 66.16L191.07 67.95L191.90 69.82L192.67 71.74L193.41 73.66L194.13 75.60L194.80 77.56L195.42 79.55L196.02 81.54L196.56 83.57L197.06 85.61L197.50 87.67L197.90 89.77L198.06 91.94L197.82 94.21L197.15 96.51L195.85 98.72L193.75 100.38L191.30 101.01L189.00 100.81L186.99 100.03L185.30 98.85L183.91 97.38L182.84 95.66L182.05 93.76L181.48 91.76L181.00 89.71L180.53 87.64L180.02 85.60L179.48 83.58L178.89 81.58L178.26 79.60L177.60 77.62L176.90 75.68L176.15 73.76L175.36 71.86L174.53 69.98L173.78 68.06L173.41 65.97L173.71 63.70L175.05 61.53L177.32 60.14Z' },
  siPendev: { title: 'Pen.dev', hex: '000000', path: 'M6 2h12v9c0 4-3.5 8.5-6 11-2.5-2.5-6-7-6-11zm6 5.7a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2zm-.45 4.9v6.9h.9v-6.9z' },
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

/** Warna ikon saat chip di-hover (--brand). undefined = tetap currentColor. */
export function brandHover(name: string, icon?: SimpleIcon): string | undefined {
  if (brandOverride[name]) return brandOverride[name];
  if (noBrand.has(name) || !icon) return undefined;
  const l = luminance(icon.hex);
  return l > 0.03 && l < 0.45 ? `#${icon.hex}` : undefined;
}
