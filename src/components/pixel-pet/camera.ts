import { PET_CONFIG as C, clamp, type Pose } from './config';
import type { CardMap } from './cards';

/** Follow the pet inside the existing carousel; wheel, swipe and navigation take priority. */
export class CarouselCamera {
  private until = 0;
  private ownsScroll = false;
  private snap = '';
  private behavior = '';

  constructor(private track: HTMLElement) {}

  follow(pose: Pose, cards: CardMap, width: number, now: number, dt: number) {
    if (now < this.until) return false;
    const margin = Math.min(C.cameraMargin, (cards.viewport.right - cards.viewport.left) / 3);
    const safeLeft = cards.viewport.left + Math.max(width / 2 + 8, margin);
    const safeRight = cards.viewport.right - Math.max(width / 2 + 8, margin);
    const delta = pose.x - clamp(pose.x, safeLeft, safeRight);
    if (Math.abs(delta) < 0.25) return false;
    const rtl = getComputedStyle(this.track).direction === 'rtl';
    const max = this.track.scrollWidth - this.track.clientWidth;
    const before = this.track.scrollLeft;
    const next = clamp(before + delta * (1 - Math.exp(-C.cameraResponse * dt)), rtl ? -max : 0, rtl ? 0 : max);
    if (Math.abs(next - before) < 0.1) return false;
    if (!this.ownsScroll) {
      this.snap = this.track.style.scrollSnapType;
      this.behavior = this.track.style.scrollBehavior;
      this.track.style.scrollSnapType = 'none';
      this.track.style.scrollBehavior = 'auto';
      this.ownsScroll = true;
    }
    this.track.scrollLeft = next;
    this.track.dataset.petCamera = 'following';
    return Math.abs(this.track.scrollLeft - before) > 0.1;
  }

  pause(now: number, duration: number, manual = false) {
    this.until = now + duration;
    if (manual) { this.restore(); this.track.dataset.petCamera = 'manual'; }
  }

  resume() { this.until = 0; }
  shift(ms: number) { if (this.until) this.until += ms; }

  private restore() {
    if (!this.ownsScroll) return;
    this.track.style.scrollSnapType = this.snap;
    this.track.style.scrollBehavior = this.behavior;
    this.ownsScroll = false;
  }

  dispose() { this.restore(); delete this.track.dataset.petCamera; }
}
