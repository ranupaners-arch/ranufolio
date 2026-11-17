import { PET_CONFIG as C, clamp, ease, lerp, random, type Action, type Direction, type Pose } from './config';
import { CardMap } from './cards';
import { CarouselCamera } from './camera';
import { EyeController } from './eyes';
import { climbPose, hidePose, jumpPose } from './motion';
import { PetRenderer } from './renderer';
import { PetStateMachine } from './state-machine';

/** Owns the only movement loop; rendering and eye tracking never start competing loops. */
export class PixelPetController {
  private abort = new AbortController();
  private renderer: PetRenderer;
  private cards: CardMap;
  private camera: CarouselCamera;
  private eyes: EyeController;
  private machine: PetStateMachine;
  private motion = matchMedia('(prefers-reduced-motion: reduce)');
  private compact = matchMedia('(max-width: 639.98px)');
  private userScrolled = false;
  private intersection: IntersectionObserver;
  private pose: Pose;
  private cardId: number;
  private direction: Direction;
  private plan?: Action;
  private queued?: Action;
  private actions: Action[] = [];
  private lastAttention = -Infinity;
  private visible = false;
  private pageVisible = true;
  private active = false;
  private pausedAt = performance.now();
  private lastInput = performance.now();
  private lastFrame = performance.now();
  private hovering = false;
  private pressed = false;
  private raf = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private disposed = false;

  constructor(private host: HTMLElement, private root: HTMLElement, track: HTMLElement) {
    const now = performance.now();
    this.renderer = new PetRenderer(host);
    this.camera = new CarouselCamera(track);
    this.cards = new CardMap(root, track, () => this.requestFrame());
    const card = this.cards.best();
    if (!card) throw new Error('Pixel Pet needs at least one project card.');
    this.cardId = card.id;
    this.direction = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    const bounds = this.cards.bounds(card, this.renderer.width);
    const approach = C.walkSpeed * C.jumpApproachMax / 1000 * 0.65;
    const start = this.direction > 0 ? Math.max(bounds.left, bounds.right - approach) : Math.min(bounds.right, bounds.left + approach);
    this.pose = { x: start, y: card.y - this.renderer.height / 2, angle: 0, sx: 1, sy: 1, behind: false };
    if (this.cards.cards.length > 1) this.plan = 'jump';
    this.eyes = new EyeController(now);
    this.machine = new PetStateMachine(this.pose, now, (mode, previous) => {
      host.dataset.mode = mode;
      host.dispatchEvent(new CustomEvent('pixel-pet:mode', { detail: { mode, previous }, bubbles: true }));
    });
    host.dataset.mode = 'idle';
    this.bind(track);
    this.intersection = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; this.sync(); });
    this.intersection.observe(root);
    this.render(now, 0.016);
  }

  private idle(now: number, duration = random(C.idleMin, C.idleMax)) {
    this.pose = { ...this.pose, angle: 0, sx: 1, sy: 1, behind: false };
    this.machine.enter('idle', now, duration, this.pose);
  }

  private finishActivity(now: number) {
    this.idle(now, random(C.activityPauseMin, C.activityPauseMax));
  }

  /** Public reusable API. Requests use the same safe paths as autonomous behavior. */
  play(action: Action, direction?: Direction): boolean {
    if (this.disposed) return false;
    const now = performance.now();
    this.activity(now);
    if (direction && ['idle', 'walk', 'sleep'].includes(this.machine.state.mode)) this.direction = direction;
    if (action === 'react') { this.react(now); this.requestFrame(); return true; }
    if (this.motion.matches && action !== 'sleep') return false;
    if (['jump', 'climb', 'hide', 'react'].includes(this.machine.state.mode)) this.queued = action;
    else this.beginPlan(action, now);
    this.requestFrame();
    return true;
  }

  private beginPlan(action: Action, now: number) {
    const card = this.cards.get(this.cardId)!;
    if (action === 'sleep') { this.plan = undefined; this.machine.enter('sleep', now, Infinity, this.pose); return; }
    if (action === 'react') { this.react(now); return; }
    if (action === 'jump') {
      const target = this.cards.neighbor(card, this.direction, this.renderer.width);
      if (!target) action = 'climb';
      else this.direction = target.x > card.x ? 1 : -1;
    }
    if (action === 'climb') {
      // Reach the nearest real edge before climbing. Walking to the far edge could
      // consume the entire awake period before this activity becomes visible.
      const bounds = this.cards.surfaceBounds(card, this.renderer.width);
      this.direction = Math.abs(this.pose.x - bounds.right) < Math.abs(this.pose.x - bounds.left) ? 1 : -1;
    }
    this.plan = action;
    const duration = action === 'jump' ? C.jumpApproachMax : action === 'hide' ? C.hideApproachMax : random(1800, 3800);
    this.machine.enter('walk', now, duration, this.pose, { side: this.direction });
  }

  private startJump(targetId: number, now: number) {
    const target = this.cards.get(targetId);
    if (!target) { this.idle(now); return; }
    const point = this.cards.landing(target, this.renderer.width, this.renderer.height, this.pose.x);
    if (!point) return;
    this.direction = point.x >= this.pose.x ? 1 : -1;
    const distance = Math.hypot(point.x - this.pose.x, point.y - this.pose.y);
    this.machine.enter('jump', now, clamp(C.jumpMin + distance * 1.1, C.jumpMin, C.jumpMax), this.pose, { target: targetId, side: this.direction });
    this.plan = undefined;
  }

  private edge(now: number) {
    const action = this.plan;
    this.plan = undefined;
    if (action === 'jump') {
      const neighbor = this.cards.neighbor(this.cards.get(this.cardId)!, this.direction, this.renderer.width);
      if (neighbor) { this.startJump(neighbor.id, now); return; }
    }
    if (action === 'climb') this.machine.enter('climb', now, C.climbDuration, this.pose, { side: this.direction });
    else if (action === 'hide') this.machine.enter('hide', now, C.hideDuration, this.pose);
    else { this.direction = this.direction > 0 ? -1 : 1; this.finishActivity(now); }
  }

  private react(now: number) {
    const previous = this.machine.state;
    // Repeated activations restart a single reaction, retaining the original suspended path.
    const resume = previous.mode === 'react' ? previous.resume
      : ['jump', 'climb', 'hide'].includes(previous.mode) ? { ...previous, origin: { ...previous.origin } } : undefined;
    if (previous.mode === 'react' && resume) resume.started += now - previous.started;
    const returnPose = previous.mode === 'react' ? previous.returnPose : { ...this.pose };
    this.machine.enter('react', now, C.reactionDuration, this.pose, { resume, returnPose, side: this.direction });
    this.camera.pause(now, C.reactionDuration);
    this.renderer.burst(this.pose, now, this.motion.matches);
    this.renderer.status.textContent = this.renderer.button.dataset.reactionLabel ?? '';
  }

  private activity(now: number) {
    this.lastInput = now;
    // Keep both the pending plan and cycle position across sleep/wake.
    if (this.machine.state.mode === 'sleep') this.idle(now, 900);
  }

  private nextAction(): Action {
    if (!this.actions.length) this.actions = [...C.behaviorCycle];
    return this.actions.shift()!;
  }

  private measure() {
    if (!this.cards.dirty) return;
    const previous = this.cards.get(this.cardId);
    this.cards.read();
    this.renderer.resize();
    const current = this.cards.get(this.cardId);
    if (current && previous) {
      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      this.pose.x += dx;
      this.pose.y += dy;
      this.machine.translate(dx, dy);
    }
  }

  private update(now: number, dt: number) {
    const card = this.cards.get(this.cardId)!;
    const { width, height } = this.renderer;
    const state = this.machine.state;
    const p = this.machine.progress(now);
    const safe = state.mode === 'idle' || state.mode === 'walk';
    if (safe && now - this.lastInput >= C.sleepAfter) { this.machine.enter('sleep', now, Infinity, this.pose); return; }

    // A swipe may move the occupied card out of view. Fly to the newly visible card,
    // using both cards' live coordinates rather than switching the occupied index.
    const best = this.cards.best();
    if (safe && best && best.id !== card.id && this.cards.visibleWidth(card) < width && this.cards.bounds(best, width).valid && !this.motion.matches) {
      this.startJump(best.id, now);
      return;
    }

    switch (state.mode) {
      case 'idle': {
        this.pose.y = card.y - height / 2;
        if (!this.motion.matches && now >= state.started + state.duration && !this.hovering && !this.pressed && !this.renderer.button.matches(':focus-visible')) {
          this.beginPlan(this.queued ?? this.plan ?? this.nextAction(), now);
          this.queued = undefined;
        }
        break;
      }
      case 'walk': {
        if (this.motion.matches) { this.plan = undefined; this.idle(now); break; }
        if (this.hovering || this.pressed || this.renderer.button.matches(':focus-visible')) { this.idle(now, 850); break; }
        if (this.eyes.distance(this.pose, this.cards.rootRect) < 100 && now - this.lastAttention > 3000) {
          this.lastAttention = now; this.idle(now, 850); break;
        }
        const bounds = this.cards.surfaceBounds(card, width);
        const goal = this.direction > 0 ? bounds.right : bounds.left;
        const step = this.direction * C.walkSpeed * dt;
        this.pose.x += this.direction > 0 ? Math.min(step, Math.max(0, goal - this.pose.x)) : Math.max(step, Math.min(0, goal - this.pose.x));
        this.pose.y = card.y - height / 2;
        if (Math.abs(this.pose.x - goal) < 1) this.edge(now);
        else if (now >= state.started + state.duration) {
          if (this.plan === 'jump' || this.plan === 'hide') this.edge(now);
          else this.idle(now);
        }
        break;
      }
      case 'jump': {
        const target = this.cards.get(state.target!);
        if (!target) { this.idle(now); break; }
        const landing = this.cards.landing(target, width, height, state.origin.x)
          ?? { x: target.x + target.width / 2, y: target.y - height / 2 };
        const arc = Math.max(10, Math.min(70, state.origin.y - height / 2 - 4, landing.y - height / 2 - 4));
        this.pose = jumpPose(state.origin, landing, p, this.motion.matches ? 0 : arc);
        if (p >= 1) {
          this.cardId = target.id;
          this.pose = { ...this.pose, ...landing, sx: 1, sy: 1 };
          this.finishActivity(now);
        }
        break;
      }
      case 'climb': {
        this.pose = climbPose(state.origin, card, state.side, p, width, height);
        if (p >= 1 || this.motion.matches) {
          this.pose = { ...state.origin, angle: 0, sx: 1, sy: 1, behind: false };
          this.direction = state.side > 0 ? -1 : 1;
          this.finishActivity(now);
        }
        break;
      }
      case 'hide': {
        this.pose = hidePose(state.origin, card, p, height);
        if (p >= 1 || this.motion.matches) { this.pose = { ...state.origin, behind: false }; this.finishActivity(now); }
        break;
      }
      case 'sleep': {
        const breath = this.motion.matches ? 0 : Math.sin((now - state.started) / 650);
        this.pose = { ...state.origin, sx: 1 + breath * 0.007, sy: 1 - breath * 0.012 };
        break;
      }
      case 'react': {
        const hop = this.motion.matches ? 0 : Math.sin(p * Math.PI) * 18;
        const home = state.returnPose ?? state.origin;
        this.pose = { ...state.origin, x: lerp(state.origin.x, home.x, ease(p)), y: lerp(state.origin.y, home.y, ease(p)) - hop, sx: this.motion.matches ? 1 : 1 + Math.sin(p * Math.PI * 2) * 0.055, sy: this.motion.matches ? 1 : 1 - Math.sin(p * Math.PI * 2) * 0.065 };
        this.pose.behind = state.origin.behind && this.pose.y + height / 2 > card.y;
        if (p >= 1) {
          this.pose = { ...home };
          if (state.resume) this.machine.restore(state.resume, now - state.started);
          else { this.pose.y = card.y - height / 2; this.idle(now, 1000); }
        }
        break;
      }
    }
    this.host.dataset.card = String(this.cardId);
  }

  private render(now: number, dt: number) {
    const state = this.machine.state;
    this.cards.rootRect = this.root.getBoundingClientRect();
    this.eyes.update(now, dt, this.pose, this.cards.rootRect, this.renderer.size, state.mode, now - state.started, this.motion.matches);
    this.renderer.render(this.pose, state.mode, this.direction, now, now - state.started, this.eyes, this.cards, this.motion.matches);
  }

  private frame = (now: number) => {
    this.raf = 0;
    if (!this.active || this.disposed) return;
    const dt = clamp((now - this.lastFrame) / 1000, 0.001, 0.05);
    this.lastFrame = now;
    this.measure();
    this.update(now, dt);
    // Di layar kecil carousel baru boleh digeser kamera pet setelah pengguna berinteraksi dengannya.
    if (!this.motion.matches && (this.userScrolled || !this.compact.matches) && ['idle', 'walk', 'jump'].includes(this.machine.state.mode)
      && this.camera.follow(this.pose, this.cards, this.renderer.width, now, dt)) {
      this.cards.dirty = true;
      this.measure();
    }
    this.render(now, dt);
    if (!this.motion.matches) this.requestFrame();
    else {
      // Reduced motion keeps eye/click feedback, without a permanent animation loop.
      clearTimeout(this.timer);
      const state = this.machine.state;
      const delay = state.mode === 'react' ? state.started + state.duration - now : C.sleepAfter - (now - this.lastInput);
      if (delay > 0) this.timer = setTimeout(() => this.requestFrame(), delay + 20);
    }
  };

  private requestFrame() {
    if (!this.raf && this.active && !this.disposed) this.raf = requestAnimationFrame(this.frame);
  }

  private sync() {
    const active = this.visible && this.pageVisible && !document.hidden;
    const now = performance.now();
    if (active && !this.active) {
      const paused = now - this.pausedAt;
      this.machine.shift(paused);
      this.eyes.shift(paused);
      this.renderer.shift(paused);
      this.camera.shift(paused);
      if (this.lastInput <= this.pausedAt) this.lastInput += paused;
      this.lastFrame = now;
      this.cards.dirty = true;
    } else if (!active && this.active) this.pausedAt = now;
    this.active = active;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    clearTimeout(this.timer);
    this.requestFrame();
  }

  private bind(track: HTMLElement) {
    const { signal } = this.abort;
    const button = this.renderer.button;
    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'touch') this.eyes.pointer = { x: event.clientX, y: event.clientY };
      this.activity(performance.now());
      this.requestFrame();
    }, { passive: true, signal });
    document.addEventListener('pointerleave', () => { this.eyes.pointer = null; this.hovering = false; this.requestFrame(); }, { signal });
    window.addEventListener('pointerdown', () => { this.activity(performance.now()); this.requestFrame(); }, { passive: true, signal });
    window.addEventListener('keydown', () => { this.activity(performance.now()); this.requestFrame(); }, { signal });
    window.addEventListener('scroll', () => { this.activity(performance.now()); this.requestFrame(); }, { passive: true, signal });
    window.addEventListener('resize', () => { this.cards.dirty = true; this.requestFrame(); }, { passive: true, signal });
    track.addEventListener('scroll', () => { this.cards.dirty = true; this.requestFrame(); }, { passive: true, signal });
    const manualScroll = () => {
      const now = performance.now();
      this.userScrolled = true;
      this.activity(now);
      this.camera.pause(now, C.manualScrollPause, true);
      this.cards.dirty = true;
      this.requestFrame();
    };
    track.addEventListener('pointerdown', manualScroll, { passive: true, signal });
    track.addEventListener('wheel', manualScroll, { passive: true, signal });
    track.addEventListener('pointermove', event => { if (event.buttons) manualScroll(); }, { passive: true, signal });
    track.addEventListener('keydown', manualScroll, { signal });
    this.root.addEventListener('click', event => { if ((event.target as Element).closest('[data-prev], [data-next]')) manualScroll(); }, { capture: true, signal });
    button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') this.hovering = true; }, { signal });
    button.addEventListener('pointerleave', () => { this.hovering = false; this.pressed = false; }, { signal });
    button.addEventListener('pointerdown', () => { this.pressed = true; }, { signal });
    button.addEventListener('pointerup', () => { this.pressed = false; }, { signal });
    button.addEventListener('pointercancel', () => { this.pressed = false; }, { signal });
    button.addEventListener('focus', () => { this.activity(performance.now()); this.requestFrame(); }, { signal });
    button.addEventListener('click', event => { event.stopPropagation(); this.pressed = false; this.play('react'); }, { signal });
    document.addEventListener('visibilitychange', () => this.sync(), { signal });
    window.addEventListener('pagehide', () => { this.pageVisible = false; this.sync(); }, { signal });
    window.addEventListener('pageshow', () => { this.pageVisible = true; this.sync(); }, { signal });
    this.motion.addEventListener('change', () => {
      if (this.motion.matches) this.camera.pause(performance.now(), Infinity, true);
      else this.camera.resume();
      if (this.motion.matches && !['idle', 'sleep', 'react'].includes(this.machine.state.mode)) {
        const card = this.cards.get(this.cardId)!;
        const landing = this.cards.landing(card, this.renderer.width, this.renderer.height, this.pose.x);
        if (landing) this.pose = { ...this.pose, ...landing };
        this.plan = undefined;
        this.idle(performance.now());
      }
      this.sync();
    }, { signal });
    document.addEventListener('astro:before-swap', () => this.dispose(), { once: true, signal });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.abort.abort();
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
    this.intersection.disconnect();
    this.cards.dispose();
    this.camera.dispose();
    this.renderer.dispose();
  }
}
