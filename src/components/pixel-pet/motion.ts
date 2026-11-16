import { clamp, ease, lerp, type Direction, type Point, type Pose } from './config';
import type { Card } from './cards';

export function jumpPose(from: Pose, target: Point, progress: number, height: number): Pose {
  const t = ease(progress);
  const squash = progress < 0.12 ? Math.sin(progress / 0.12 * Math.PI) : progress > 0.88 ? Math.sin((progress - 0.88) / 0.12 * Math.PI) : 0;
  return {
    x: lerp(from.x, target.x, t),
    y: lerp(from.y, target.y, t) - 4 * height * progress * (1 - progress),
    angle: 0,
    sx: 1 + squash * 0.08,
    sy: 1 - squash * 0.1 + Math.sin(progress * Math.PI) * 0.035,
    behind: false,
  };
}

export function climbPose(from: Pose, card: Card, side: Direction, progress: number, width: number, height: number): Pose {
  const edge = side > 0 ? card.x + card.width : card.x;
  const top = { x: edge + side * height / 2, y: card.y + width / 2 + 4 };
  const depth = Math.min(110, card.height * 0.35);
  let p: Pose;
  if (progress < 0.18) {
    const t = ease(progress / 0.18);
    p = { ...from, x: lerp(from.x, top.x, t), y: lerp(from.y, top.y, t), angle: side * 90 * t };
  } else if (progress < 0.82) {
    const t = (progress - 0.18) / 0.64;
    p = { ...from, x: top.x, y: top.y + Math.sin(t * Math.PI) * depth, angle: side * 90 };
  } else {
    const t = ease((progress - 0.82) / 0.18);
    p = { ...from, x: lerp(top.x, from.x, t), y: lerp(top.y, from.y, t), angle: side * 90 * (1 - t) };
  }
  return { ...p, sx: 1, sy: 1, behind: false };
}

export function hidePose(from: Pose, card: Card, progress: number, height: number): Pose {
  const entering = ease(clamp(progress / 0.2, 0, 1));
  const leaving = ease(clamp((progress - 0.8) / 0.2, 0, 1));
  const peek = progress > 0.2 && progress < 0.8 ? Math.sin((progress - 0.2) * Math.PI * 9) * 2.5 : 0;
  const y = card.y - height / 2 + height * 0.72 * (entering - leaving) + peek;
  return { ...from, y, angle: 0, sx: 1, sy: 1, behind: y + height / 2 > card.y + 0.1 };
}
