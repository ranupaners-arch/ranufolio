import { PET_CONFIG as C, random, type Mode, type Point, type Pose } from './config';

export type Expression = 'open' | 'squint' | 'closed' | 'surprised';

export class EyeController {
  pointer: Point | null = null;
  x = 0;
  y = 0;
  expression: Expression = 'open';
  private nextBlink: number;
  constructor(now: number) { this.nextBlink = now + random(C.blinkMin, C.blinkMax); }

  update(now: number, dt: number, pose: Pose, rect: DOMRect, size: number, mode: Mode, elapsed: number, reduced: boolean) {
    const dx = this.pointer ? this.pointer.x - rect.left - pose.x : 0;
    const dy = this.pointer ? this.pointer.y - rect.top - pose.y : 0;
    const angle = -pose.angle * Math.PI / 180;
    const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
    const limit = C.eyeOffsetAt160 * size / 160;
    const alpha = reduced ? 1 : 1 - Math.exp(-C.eyeResponse * dt);
    this.x += (Math.tanh(localX / C.eyeSensitivity) * limit - this.x) * alpha;
    this.y += (Math.tanh(localY / C.eyeSensitivity) * limit - this.y) * alpha;

    if (now >= this.nextBlink + C.blinkDuration) this.nextBlink = now + random(C.blinkMin, C.blinkMax);
    this.expression = mode === 'react' ? 'surprised'
      : mode === 'sleep' ? elapsed < 350 && !reduced ? 'squint' : 'closed'
      : !reduced && now >= this.nextBlink ? 'closed'
      : this.pointer && Math.hypot(dx, dy) < C.squintDistance ? 'squint' : 'open';
    if (mode === 'sleep') { this.x *= 0.8; this.y *= 0.8; }
  }

  distance(pose: Pose, rect: DOMRect) {
    return this.pointer ? Math.hypot(this.pointer.x - rect.left - pose.x, this.pointer.y - rect.top - pose.y) : Infinity;
  }
  shift(ms: number) { this.nextBlink += ms; }
}
