import { ASSET_BASE, PET_CONFIG as C, clamp, manifest, random, type AnimationName, type Direction, type FrameName, type Mode, type Pose } from './config';
import type { CardMap } from './cards';
import type { EyeController } from './eyes';

type Particle = { element: HTMLElement; vx: number; vy: number; size: number };

export class PetRenderer {
  readonly actor: HTMLElement;
  readonly button: HTMLButtonElement;
  readonly status: HTMLElement;
  size = 100;
  width = 0;
  height = 0;
  private front: HTMLElement;
  private back: HTMLElement;
  private layers: HTMLElement;
  private sprite: HTMLElement;
  private eyeImage: HTMLImageElement;
  private bubble: HTMLElement;
  private effects: HTMLElement;
  private frame?: FrameName;
  private eyeFile = '';
  private particles: Particle[] = [];
  private burstStart = -Infinity;
  private burstOrigin = { x: 0, y: 0 };
  private reducedBurst = false;

  constructor(readonly host: HTMLElement) {
    const q = <T extends HTMLElement>(s: string) => host.querySelector<T>(s)!;
    this.actor = q('[data-pet-actor]');
    this.button = q('[data-pet-button]');
    this.status = q('[data-pet-status]');
    this.front = q('[data-pet-front]');
    this.back = q('[data-pet-back]');
    this.layers = q('[data-pet-layers]');
    this.sprite = q('[data-pet-frame]');
    this.eyeImage = q('[data-pet-eyes]');
    this.bubble = q('[data-pet-sleep]');
    this.effects = q('[data-pet-effects]');
    this.resize();
    // Decode the real atlas and expressions before the first change of mode.
    for (const file of [manifest.atlas.file, ...Object.values(manifest.layers).map(layer => layer.file)]) {
      const image = new Image();
      image.src = ASSET_BASE + file;
      void image.decode().catch(() => {});
    }
  }

  resize() {
    this.size = matchMedia('(max-width: 639px)').matches ? C.mobileCanvasSize : C.canvasSize;
    const scale = this.size / manifest.frameWidth;
    this.width = manifest.originalSpriteBounds.width * scale;
    this.height = manifest.originalSpriteBounds.height * scale;
    this.host.style.setProperty('--pet-size', `${this.size}px`);
    this.host.style.setProperty('--pet-width', `${this.width}px`);
    this.host.style.setProperty('--pet-height', `${this.height}px`);
    this.host.style.setProperty('--pet-left', `${-manifest.originalSpriteBounds.x * scale}px`);
    this.host.style.setProperty('--pet-top', `${-manifest.originalSpriteBounds.y * scale}px`);
    this.sprite.style.backgroundSize = `${manifest.atlas.width * scale}px ${manifest.atlas.height * scale}px`;
    this.frame = undefined;
  }

  private showFrame(name: FrameName) {
    if (this.frame === name) return;
    const { x, y } = manifest.frames[name];
    const scale = this.size / manifest.frameWidth;
    this.sprite.style.backgroundPosition = `${-x * scale}px ${-y * scale}px`;
    this.sprite.dataset.frame = name;
    this.frame = name;
  }

  private animate(name: AnimationName, elapsed: number) {
    const animation = manifest.animations[name];
    const duration = animation.durationsMs.reduce((a, b) => a + b, 0);
    let remaining = animation.loop ? elapsed % duration : Math.min(elapsed, duration - 1);
    let index = 0;
    while (index < animation.frames.length - 1 && remaining >= animation.durationsMs[index]) remaining -= animation.durationsMs[index++];
    this.showFrame(animation.frames[index] as FrameName);
  }

  render(pose: Pose, mode: Mode, direction: Direction, now: number, elapsed: number, eyes: EyeController, cards: CardMap, reduced: boolean) {
    this.actor.hidden = false;
    this.button.hidden = false;
    const plane = pose.behind ? this.back : this.front;
    if (this.actor.parentElement !== plane) plane.append(this.actor);
    const x = pose.x - this.width / 2;
    const y = pose.y - this.height / 2;
    this.actor.style.transform = `translate3d(${x}px,${y}px,0) rotate(${pose.angle}deg) scale(${pose.sx},${pose.sy})`;
    this.actor.dataset.behind = String(pose.behind);
    this.actor.dataset.angle = String(pose.angle);
    this.bubble.hidden = mode !== 'sleep';

    const layered = reduced || mode === 'idle' || mode === 'hide' || mode === 'sleep' || mode === 'react' && elapsed < 230;
    this.layers.hidden = !layered;
    this.sprite.hidden = layered;
    this.host.dataset.visual = layered ? 'layers' : 'atlas';
    if (layered) {
      const key = `eyes-${eyes.expression}` as keyof typeof manifest.layers;
      const file = manifest.layers[key].file;
      if (this.eyeFile !== file) { this.eyeImage.src = ASSET_BASE + file; this.eyeFile = file; }
      this.eyeImage.style.transform = `translate(${eyes.x.toFixed(3)}px,${eyes.y.toFixed(3)}px)`;
      this.eyeImage.dataset.expression = eyes.expression;
    } else {
      this.animate(mode === 'react' ? 'touch' : mode === 'jump' ? 'jump' : direction < 0 ? 'walk-left' : 'walk-right', mode === 'react' ? elapsed - 230 : elapsed);
    }

    // The independent foreground button follows only the exposed silhouette.
    // The rendered pet can sit behind a card without putting a button over its link.
    const angle = pose.angle * Math.PI / 180;
    const bw = Math.abs(this.width * Math.cos(angle)) + Math.abs(this.height * Math.sin(angle));
    const bh = Math.abs(this.height * Math.cos(angle)) + Math.abs(this.width * Math.sin(angle));
    const hitHeight = Math.max(44, bh);
    const hit = cards.exposedHitBox({ x: pose.x - bw / 2, y: pose.y + bh / 2 - hitHeight, width: bw, height: hitHeight });
    Object.assign(this.button.style, { left: `${hit.x}px`, top: `${hit.y}px`, width: `${hit.width}px`, height: `${hit.height}px`, pointerEvents: hit.width > 1 && hit.height > 1 ? 'auto' : 'none' });
    this.host.dataset.x = pose.x.toFixed(2);
    this.host.dataset.y = pose.y.toFixed(2);
    this.host.dataset.facing = direction > 0 ? 'right' : 'left';
    this.renderParticles(now);
  }

  burst(pose: Pose, now: number, reduced: boolean) {
    this.effects.replaceChildren();
    this.burstStart = now;
    this.burstOrigin = { x: pose.x, y: pose.y - this.height / 3 };
    this.reducedBurst = reduced;
    this.particles = Array.from({ length: C.particleCount }, (_, i) => {
      const element = document.createElement('span');
      element.className = 'pet-particle';
      const size = Math.round(random(2, 4));
      element.style.width = element.style.height = `${size}px`;
      this.effects.append(element);
      const angle = i / C.particleCount * Math.PI * 2;
      return { element, size, vx: Math.cos(angle) * random(35, 75), vy: Math.sin(angle) * random(30, 70) - 35 };
    });
  }

  private renderParticles(now: number) {
    const t = (now - this.burstStart) / 1000;
    if (t > 0.7) { if (this.particles.length) this.effects.replaceChildren(); this.particles = []; return; }
    for (const p of this.particles) {
      const time = this.reducedBurst ? 0.25 : t;
      const x = this.burstOrigin.x + p.vx * time;
      const y = this.burstOrigin.y + p.vy * time + (this.reducedBurst ? 0 : 60 * time * time);
      p.element.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
      p.element.style.opacity = String(this.reducedBurst ? 1 : clamp(1 - t / 0.7, 0, 1));
    }
  }

  shift(ms: number) { this.burstStart += ms; }
  dispose() { this.effects.replaceChildren(); }
}
