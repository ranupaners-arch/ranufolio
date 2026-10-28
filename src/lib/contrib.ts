export type Day = { date: string; count: number; level: number };
export const CONTRIB_USER = 'ranupaners-arch';
export const CONTRIB_URL = `https://github-contributions-api.jogruber.de/v4/${CONTRIB_USER}?y=last`;

// Warna intensitas dari variabel tema (accent + soft), aman untuk light/dark.
export const levelBg = (l: number) =>
  l <= 0 ? 'var(--soft)' : `color-mix(in oklab, var(--color-accent) ${[25, 50, 75, 100][Math.min(4, l) - 1]}%, transparent)`;

export function layout(days: Day[]) {
  const weeks: (Day | null)[][] = [];
  if (days.length) {
    const firstDow = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
    const padded: (Day | null)[] = [...Array(firstDow).fill(null), ...days];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    const firstActive = weeks.findIndex((w) => w.some((d) => d && d.count > 0));
    if (firstActive > 0) weeks.splice(0, firstActive);
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

export const summaryText = (tpl: string, lang: string, total: number, months: number) =>
  tpl.replace('{x}', total.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')).replace('{n}', String(months));

export const parse = (json: unknown): Day[] | null => {
  const c = (json as { contributions?: unknown })?.contributions;
  return Array.isArray(c) && c.length ? (c as Day[]) : null;
};
