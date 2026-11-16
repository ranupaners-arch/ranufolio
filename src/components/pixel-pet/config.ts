import manifest from '../../../public/assets/ranufolio-pet/manifest.json';

export { manifest };
export const ASSET_BASE = '/assets/ranufolio-pet/';

/** All distances are CSS pixels, times are milliseconds. No animation library needed. */
export const PET_CONFIG = {
  canvasSize: 100,
  mobileCanvasSize: 90,
  walkSpeed: 70,
  behaviorCycle: ['hide', 'jump', 'climb', 'jump', 'walk', 'jump'],
  activityPauseMin: 200,
  activityPauseMax: 350,
  hideApproachMax: 450,
  jumpApproachMax: 1400,
  cameraMargin: 80,
  cameraResponse: 20,
  manualScrollPause: 2500,
  eyeOffsetAt160: 4,
  eyeResponse: 14,
  eyeSensitivity: 95,
  squintDistance: 85,
  blinkMin: 2000,
  blinkMax: 6000,
  blinkDuration: 150,
  idleMin: 550,
  idleMax: 1400,
  // Leave up to four seconds to finish a hide/climb safely, still sleeping by ~15s.
  sleepAfter: 11000,
  jumpMin: 600,
  jumpMax: 1100,
  climbDuration: 3200,
  hideDuration: 4000,
  reactionDuration: 850,
  particleCount: 12,
} as const;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => t * t * (3 - 2 * t);
export const random = (min: number, max: number) => min + Math.random() * (max - min);

export type Mode = 'idle' | 'walk' | 'jump' | 'climb' | 'hide' | 'sleep' | 'react';
export type Action = Exclude<Mode, 'idle'>;
export type Direction = -1 | 1;
export type Point = { x: number; y: number };
export type Pose = Point & { angle: number; sx: number; sy: number; behind: boolean };
export type FrameName = keyof typeof manifest.frames;
export type AnimationName = keyof typeof manifest.animations;
