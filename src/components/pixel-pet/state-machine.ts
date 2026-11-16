import type { Direction, Mode, Pose } from './config';

export type PetState = {
  mode: Mode;
  started: number;
  duration: number;
  origin: Pose;
  side: Direction;
  target?: number;
  resume?: PetState;
  returnPose?: Pose;
};

/** One authoritative primary animation. A reaction pauses, then restores, a flight or climb. */
export class PetStateMachine {
  state: PetState;
  constructor(pose: Pose, now: number, private changed: (mode: Mode, previous: Mode) => void) {
    this.state = { mode: 'idle', started: now, duration: 700, origin: { ...pose }, side: 1 };
  }
  enter(mode: Mode, now: number, duration: number, pose: Pose, extra: Partial<PetState> = {}) {
    const previous = this.state.mode;
    this.state = { mode, started: now, duration, origin: { ...pose }, side: 1, ...extra };
    this.changed(mode, previous);
  }
  restore(state: PetState, pausedFor: number) {
    const previous = this.state.mode;
    this.state = { ...state, started: state.started + pausedFor };
    this.changed(state.mode, previous);
  }
  progress(now: number) { return Math.max(0, Math.min(1, (now - this.state.started) / this.state.duration)); }
  shift(ms: number, state = this.state) {
    state.started += ms;
    if (state.resume) this.shift(ms, state.resume);
  }
  translate(dx: number, dy: number, state = this.state) {
    state.origin.x += dx;
    state.origin.y += dy;
    if (state.returnPose) { state.returnPose.x += dx; state.returnPose.y += dy; }
    if (state.resume) this.translate(dx, dy, state.resume);
  }
}
