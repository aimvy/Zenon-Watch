import * as THREE from 'three';
import VANTA from 'vanta/dist/vanta.fog.min';

export class SmokeEffect {
  private effect: any;
  private container: HTMLElement;
  private background: HTMLDivElement;
  private currentSpeed: number = 0.45;
  private targetSpeed: number = 0.45;
  private currentZoom: number = 0.20;
  private scrollTimeout: any;
  private animationFrameId: number | null = null;
  private lastScrollTop: number = 0;
  private scrollVelocity: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupBackground();
    this.initEffect();
    this.setupScrollHandler();
  }

  private setupBackground() {
    // Créer un div de fond
    this.background = document.createElement('div');
    this.background.style.position = 'fixed';
    this.background.style.top = '0';
    this.background.style.left = '0';
    this.background.style.width = '100vw';
    this.background.style.height = '100vh';
    this.background.style.zIndex = '-1';
    
    // Ajouter le div au conteneur
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.zIndex = '-1';
    this.container.insertBefore(this.background, this.container.firstChild);

    // Mettre à jour la couleur de fond initiale
    this.updateBackgroundColor();

    // Observer les changements de thème
    const observer = new MutationObserver(() => {
      this.updateBackgroundColor();
      this.updateEffectColors();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private updateBackgroundColor() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    this.background.style.backgroundColor = isDarkMode ? '#000000' : '#ffffff';
  }

  private updateEffectColors() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    if (this.effect) {
      this.effect.setOptions({
        highlightColor: isDarkMode ? 0xff0000 : 0xff0000,
        midtoneColor: isDarkMode ? 0xcc0000 : 0xff0000,
        lowlightColor: isDarkMode ? 0x660000 : 0xee0000,
        baseColor: isDarkMode ? 0x000000 : 0xffffff,
        blurFactor: isDarkMode ? 0.45 : 0.25,
        speed: 0.45,
        zoom: 0.20
      });
    }
  }

  private initEffect() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    try {
      this.effect = VANTA({
        el: this.container,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: window.innerHeight,
        minWidth: window.innerWidth,
        highlightColor: isDarkMode ? 0xff0000 : 0xff0000,
        midtoneColor: isDarkMode ? 0xcc0000 : 0xff0000,
        lowlightColor: isDarkMode ? 0x660000 : 0xee0000,
        baseColor: isDarkMode ? 0x000000 : 0xffffff,
        blurFactor: isDarkMode ? 0.45 : 0.25,
        speed: 0.45,
        zoom: 0.20
      });

      // Ajouter un gestionnaire de redimensionnement
      window.addEventListener('resize', () => {
        if (this.effect) {
          this.effect.resize();
        }
      });
    } catch (error) {
      console.error('Failed to initialize smoke effect:', error);
    }
  }

  private updateEffect(newSpeed: number, newZoom: number) {
    if (this.effect) {
      this.effect.setOptions({
        speed: newSpeed,
        zoom: newZoom
      });
    }
  }

  private updateVelocity = () => {
    const currentScrollTop = window.pageYOffset;
    const delta = Math.abs(currentScrollTop - this.lastScrollTop);
    this.scrollVelocity = Math.min(delta * 0.015, 4);
    this.lastScrollTop = currentScrollTop;

    this.targetSpeed = 0.45 + (this.scrollVelocity * 3.5);
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.2;
    
    this.updateEffect(this.currentSpeed, this.currentZoom);

    if (this.scrollVelocity > 0) {
      this.scrollVelocity *= 0.92;
      this.animationFrameId = requestAnimationFrame(this.updateVelocity);
    } else if (this.currentSpeed > 0.46) {
      this.animationFrameId = requestAnimationFrame(this.updateVelocity);
    }
  };

  private handleScroll = () => {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(this.updateVelocity);

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.targetSpeed = 0.45;
      this.updateVelocity();
    }, 150);
  };

  private setupScrollHandler() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  public destroy() {
    if (this.effect) {
      this.effect.destroy();
    }
    window.removeEventListener('scroll', this.handleScroll);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    clearTimeout(this.scrollTimeout);
  }
}
