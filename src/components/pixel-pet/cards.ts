import { clamp, type Direction, type Point } from './config';

export type Card = { id: number; element: HTMLElement; x: number; y: number; width: number; height: number };

/** Read real card rectangles, including carousel scroll and RTL. Never resize a card. */
export class CardMap {
  cards: Card[] = [];
  viewport = { left: 0, right: 0 };
  rootRect!: DOMRect;
  dirty = true;
  private observer: ResizeObserver;

  constructor(readonly root: HTMLElement, readonly track: HTMLElement, invalidate: () => void) {
    this.observer = new ResizeObserver(() => { this.dirty = true; invalidate(); });
    this.observer.observe(root);
    this.observer.observe(track);
    track.querySelectorAll<HTMLElement>('[data-project-tile]').forEach(tile => this.observer.observe(tile));
    this.read();
  }

  read() {
    this.rootRect = this.root.getBoundingClientRect();
    const trackRect = this.track.getBoundingClientRect();
    this.viewport = { left: Math.max(0, trackRect.left - this.rootRect.left), right: Math.min(this.rootRect.width, trackRect.right - this.rootRect.left) };
    this.cards = [...this.track.querySelectorAll<HTMLElement>('[data-project-tile] > a')].map((element, id) => {
      const r = element.getBoundingClientRect();
      return { id, element, x: r.left - this.rootRect.left, y: r.top - this.rootRect.top, width: r.width, height: r.height };
    });
    this.dirty = false;
  }

  get(id: number) { return this.cards.find(card => card.id === id); }

  visibleWidth(card: Card) {
    return Math.max(0, Math.min(card.x + card.width, this.viewport.right) - Math.max(card.x, this.viewport.left));
  }

  best() { return this.cards.reduce<Card | undefined>((a, b) => !a || this.visibleWidth(b) > this.visibleWidth(a) ? b : a, undefined); }

  bounds(card: Card, width: number) {
    const left = Math.max(card.x, this.viewport.left) + width / 2 + 5;
    const right = Math.min(card.x + card.width, this.viewport.right) - width / 2 - 5;
    return { left, right, valid: right >= left };
  }

  surfaceBounds(card: Card, width: number) {
    return { left: card.x + width / 2 + 5, right: card.x + card.width - width / 2 - 5 };
  }

  landing(card: Card, width: number, height: number, fromX: number): Point | null {
    const bounds = this.surfaceBounds(card, width);
    return bounds.right >= bounds.left ? { x: clamp(fromX, bounds.left, bounds.right), y: card.y - height / 2 } : null;
  }

  neighbor(card: Card, direction: Direction, width: number) {
    const candidates = this.cards.filter(c => c.id !== card.id && c.width >= width + 10);
    const forward = candidates.filter(c => Math.sign(c.x - card.x) === direction);
    return (forward.length ? forward : candidates).sort((a, b) => Math.abs(a.x - card.x) - Math.abs(b.x - card.x))[0];
  }

  /** Keep the click target out of the opaque card interiors while climbing/hiding. */
  exposedHitBox(rect: { x: number; y: number; width: number; height: number }) {
    let result = { ...rect };
    for (const c of this.cards) {
      if (result.y + result.height <= c.y || result.y >= c.y + c.height || result.x + result.width <= c.x || result.x >= c.x + c.width) continue;
      const above = Math.max(0, c.y - result.y);
      const left = Math.max(0, c.x - result.x);
      const right = Math.max(0, result.x + result.width - (c.x + c.width));
      if (above > 0) result.height = above;
      else if (left >= right) result.width = left;
      else { result.x = c.x + c.width; result.width = right; }
    }
    result.x = Math.max(this.viewport.left, result.x);
    result.width = Math.max(0, Math.min(result.width, this.viewport.right - result.x));
    return result;
  }

  dispose() { this.observer.disconnect(); }
}
