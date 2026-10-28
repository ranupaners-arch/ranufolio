export type Day = { date: string; count: number; level: number };
export const CONTRIB_USER = 'ranupaners-arch';
export const CONTRIB_URL = `https://github-contributions-api.jogruber.de/v4/${CONTRIB_USER}?y=last`;

// Warna intensitas dari variabel tema (accent + soft), aman untuk light/dark.
// Skala referensi: 0 = fg/5, lalu accent 25/50/75/100% (ambang 1-6, 7-11, 12-17, 18+).
export const levelOf = (c: number) => (c <= 0 ? 0 : c <= 6 ? 1 : c <= 11 ? 2 : c <= 17 ? 3 : 4);
export const levelBg = (l: number) =>
  l <= 0
    ? 'color-mix(in srgb, var(--ink) 5%, transparent)'
    : `color-mix(in srgb, var(--color-accent) ${[25, 50, 75, 100][Math.min(4, l) - 1]}%, transparent)`;
export const MAX_WEEKS = 39;
export const MOBILE_WEEKS = 20;

export function layout(days: Day[]) {
  const weeks: (Day | null)[][] = [];
  if (days.length) {
    const firstDow = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
    const padded: (Day | null)[] = [...Array(firstDow).fill(null), ...days];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    const firstActive = weeks.findIndex((w) => w.some((d) => d && d.count > 0));
    if (firstActive > 0) weeks.splice(0, firstActive);
    if (weeks.length > MAX_WEEKS) weeks.splice(0, weeks.length - MAX_WEEKS);
    // Kolom terakhir parsial s/d hari ini (tanpa kotak masa depan).
    const today = new Date().toISOString().slice(0, 10);
    const last = weeks[weeks.length - 1];
    if (last) weeks[weeks.length - 1] = last.filter((d) => !d || d.date <= today);
  }
  const shown = weeks.flat().filter((d): d is Day => !!d);
  const total = shown.reduce((a, d) => a + d.count, 0);
  let months = 0;
  if (shown.length) {
    const a = Date.parse(shown[0].date + 'T00:00:00Z');
    const b = Date.parse(shown[shown.length - 1].date + 'T00:00:00Z');
    months = Math.max(1, Math.round((b - a) / (30.44 * 864e5)));
  }
  return { weeks, total, months };
}

export const fmtNum = (n: number, lang: string) => n.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US');
export const summaryText = (tpl: string, lang: string, total: number, months: number) =>
  tpl.replace('{x}', fmtNum(total, lang)).replace('{n}', String(months));
// Pecah jadi angka (tebal) + sisa teks (abu), template diawali {x}.
export const summaryParts = (tpl: string, lang: string, total: number, months: number) => {
  const rest = tpl.replace('{n}', String(months)).split('{x}');
  return { num: fmtNum(total, lang), pre: rest[0] ?? '', post: rest[1] ?? '' };
};

export const parse = (json: unknown): Day[] | null => {
  const c = (json as { contributions?: unknown })?.contributions;
  return Array.isArray(c) && c.length ? (c as Day[]) : null;
};
