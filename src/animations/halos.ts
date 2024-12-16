import { BaseEffect } from './types';

interface Halo {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  targetSize: number;
  deformPhase: number;
  deformSpeed: number;
  deformAmount: number;
  color: string;
  opacity: number;
  blur: number;
  lifeTime: number;
  maxLife: number;
  birthTime: number;
  phase: number;
  phaseSpeed: number;
  amplitude: number;
  frequency: number;
  secondaryPhase: number;
}

interface Boundary {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const BOUNDARY_MARGIN = 300;
const BASE_MOVEMENT_SPEED = 0.05;
const DEFORM_BASE_SPEED = 0.001;
const MIN_LIFE_TIME = 20000;
const MAX_LIFE_TIME = 40000;
const MIN_HALOS = 5;
const MAX_HALOS = 8;
const BASE_WAVE_SPEED = 0.001;

export class HalosEffect implements BaseEffect {
  private container: HTMLElement;
  private halos: Halo[] = [];
  private nextId = 0;
  private boundary: Boundary;
  private isDarkMode: boolean;
  private animationFrameId?: number;
  private lastTime = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.boundary = this.calculateBoundary();
    this.initHalos();
    this.animate();

    window.addEventListener('resize', this.handleResize);
  }

  private calculateBoundary(): Boundary {
    return {
      left: -BOUNDARY_MARGIN,
      right: window.innerWidth + BOUNDARY_MARGIN,
      top: -BOUNDARY_MARGIN,
      bottom: window.innerHeight + BOUNDARY_MARGIN
    };
  }

  private createHalo(spawnAtEdge = false): Halo {
    const baseSize = 150 + Math.random() * 500;
    const size = baseSize * (0.6 + Math.random() * 0.8);
    const expansionFactor = Math.random() < 0.3 ? 2.5 : 1.5;

    let x: number, y: number;
    let vx: number, vy: number;

    const baseSpeed = BASE_MOVEMENT_SPEED * (0.8 + Math.random() * 0.4);

    if (spawnAtEdge) {
      const edge = Math.floor(Math.random() * 4);
      const speed = baseSpeed * (1 + Math.random() * 0.5);
      
      switch (edge) {
        case 0:
          x = Math.random() * window.innerWidth;
          y = -size;
          vx = (Math.random() - 0.5) * speed * 2;
          vy = speed;
          break;
        case 1:
          x = window.innerWidth + size;
          y = Math.random() * window.innerHeight;
          vx = -speed;
          vy = (Math.random() - 0.5) * speed * 2;
          break;
        case 2:
          x = Math.random() * window.innerWidth;
          y = window.innerHeight + size;
          vx = (Math.random() - 0.5) * speed * 2;
          vy = -speed;
          break;
        default:
          x = -size;
          y = Math.random() * window.innerHeight;
          vx = speed;
          vy = (Math.random() - 0.5) * speed * 2;
      }
    } else {
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * baseSpeed;
      vy = Math.sin(angle) * baseSpeed;
    }

    const hue = 0;
    const saturation = this.isDarkMode
      ? (85 + Math.random() * 15)
      : (90 + Math.random() * 10);
    const lightness = this.isDarkMode
      ? (20 + Math.random() * 30)
      : (35 + Math.random() * 25);
    const baseOpacity = Math.random() < 0.3
      ? (this.isDarkMode ? (0.8 + Math.random() * 0.2) : (0.85 + Math.random() * 0.15))
      : (this.isDarkMode ? (0.3 + Math.random() * 0.3) : (0.4 + Math.random() * 0.3));

    const now = performance.now();
    return {
      id: this.nextId++,
      x,
      y,
      vx,
      vy,
      size,
      baseSize: size,
      targetSize: size * (0.4 + Math.random() * expansionFactor),
      deformPhase: Math.random() * Math.PI * 2,
      deformSpeed: DEFORM_BASE_SPEED * (0.7 + Math.random() * 0.6),
      deformAmount: 0.2 + Math.random() * 0.3,
      color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${baseOpacity})`,
      opacity: 0,
      blur: this.isDarkMode ? (40 + Math.random() * 100) : (30 + Math.random() * 80),
      lifeTime: 0,
      maxLife: MIN_LIFE_TIME + Math.random() * (MAX_LIFE_TIME - MIN_LIFE_TIME),
      birthTime: now,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: BASE_WAVE_SPEED * (0.8 + Math.random() * 0.4),
      amplitude: 0.5 + Math.random() * 1.5,
      frequency: 0.3 + Math.random() * 0.7,
      secondaryPhase: Math.random() * Math.PI * 2
    };
  }

  private initHalos(): void {
    const initialCount = Math.floor((MIN_HALOS + MAX_HALOS) / 2);
    this.halos = Array(initialCount).fill(null).map(() => this.createHalo(false));
  }

  private updateHalo(halo: Halo, deltaTime: number, scrollSpeed: number = 0): void {
    const speedMultiplier = 1 + (scrollSpeed * 1.5);
    halo.x += halo.vx * deltaTime * speedMultiplier;
    halo.y += halo.vy * deltaTime * speedMultiplier;

    const bounceSpeedRetention = 0.8;
    
    if (halo.x - halo.size/2 < this.boundary.left) {
      halo.x = this.boundary.left + halo.size/2;
      halo.vx = Math.abs(halo.vx) * bounceSpeedRetention;
    } else if (halo.x + halo.size/2 > this.boundary.right) {
      halo.x = this.boundary.right - halo.size/2;
      halo.vx = -Math.abs(halo.vx) * bounceSpeedRetention;
    }

    if (halo.y - halo.size/2 < this.boundary.top) {
      halo.y = this.boundary.top + halo.size/2;
      halo.vy = Math.abs(halo.vy) * bounceSpeedRetention;
    } else if (halo.y + halo.size/2 > this.boundary.bottom) {
      halo.y = this.boundary.bottom - halo.size/2;
      halo.vy = -Math.abs(halo.vy) * bounceSpeedRetention;
    }

    halo.lifeTime = performance.now() - halo.birthTime;
    const lifeProgress = halo.lifeTime / halo.maxLife;

    if (lifeProgress >= 1) {
      const index = this.halos.findIndex(h => h.id === halo.id);
      if (index !== -1) {
        this.halos[index] = this.createHalo(true);
      }
    }

    halo.opacity = Math.min(1, Math.min(lifeProgress * 3, (1 - lifeProgress) * 3));
    halo.deformPhase += halo.deformSpeed * deltaTime;
    halo.phase += halo.phaseSpeed * deltaTime;
    halo.secondaryPhase += halo.phaseSpeed * 1.5 * deltaTime;

    const sizeWave = Math.sin(halo.phase) * halo.amplitude;
    const secondaryWave = Math.sin(halo.secondaryPhase) * halo.amplitude * 0.5;
    const combinedWave = (sizeWave + secondaryWave) * halo.frequency;
    
    halo.size = halo.baseSize + (halo.targetSize - halo.baseSize) * (0.5 + combinedWave * 0.5);
  }

  private renderHalo(halo: Halo): void {
    const existingElement = this.container.querySelector(`[data-halo-id="${halo.id}"]`);
    let element: HTMLDivElement;

    if (existingElement) {
      element = existingElement as HTMLDivElement;
    } else {
      element = document.createElement('div');
      element.className = 'blob';
      element.setAttribute('data-halo-id', halo.id.toString());
      this.container.appendChild(element);
    }

    const style = element.style;
    style.transform = `translate(${halo.x}px, ${halo.y}px)`;
    style.width = `${halo.size}px`;
    style.height = `${halo.size}px`;
    style.opacity = halo.opacity.toString();
    style.filter = `blur(${halo.blur}px)`;
  }

  private animate = (): void => {
    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    this.halos.forEach(halo => {
      this.updateHalo(halo, deltaTime);
      this.renderHalo(halo);
    });

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private handleResize = (): void => {
    this.boundary = this.calculateBoundary();
  };

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    // Remove all halo elements
    const haloElements = this.container.querySelectorAll('[data-halo-id]');
    haloElements.forEach(element => element.remove());
    
    this.halos = [];
  }
}
