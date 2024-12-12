import * as THREE from 'three';
import VANTA from 'vanta/src/vanta.topology';

export class TopologyEffect {
  private effect: any;
  private container: HTMLElement;
  private background: HTMLDivElement;
  private vantaBackground: HTMLDivElement;
  private currentSpeed: number = 1.0;
  private targetSpeed: number = 1.0;
  private scrollTimeout: any;
  private animationFrameId: number | null = null;
  private lastScrollTop: number = 0;
  private scrollVelocity: number = 0;
  private resetInterval: any = null;
  private fadeTimeout: any = null;
  private boomerangInterval: any = null;
  private isReversed: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupBackground();
    this.initEffect();
    this.setupScrollHandler();
    this.setupResetAnimation();
    this.setupBoomerangEffect();
  }

  private setupBoomerangEffect() {
    // Alterner entre avant et arrière toutes les 6 secondes
    this.boomerangInterval = setInterval(() => {
      this.isReversed = !this.isReversed;
      if (this.effect) {
        const currentSpeed = this.effect.options.speed || 1;
        const baseSpeed = Math.abs(currentSpeed);
        this.effect.setOptions({
          speed: this.isReversed ? -baseSpeed : baseSpeed
        });
      }
    }, 6000);
  }

  private setupResetAnimation() {
    const ANIMATION_DURATION = 20000; // 20 secondes
    const FADE_DURATION = 8000; // 8 secondes pour le fade out

    const resetAnimation = () => {
      // Commencer le fade out
      if (this.vantaBackground) {
        this.vantaBackground.style.transition = `opacity ${FADE_DURATION}ms ease-out`;
        this.vantaBackground.style.opacity = '0';
      }

      // Attendre que le fade out soit terminé
      this.fadeTimeout = setTimeout(() => {
        if (this.effect) {
          // Détruire l'ancien effet
          this.effect.destroy();
          
          // Réinitialiser le conteneur
          if (this.vantaBackground) {
            this.vantaBackground.style.transition = '';
            this.vantaBackground.style.opacity = '1';
          }
          
          // Réinitialiser l'effet avec de nouveaux paramètres
          this.initEffect();
        }
      }, FADE_DURATION);
    };

    // Démarrer le cycle de réinitialisation
    this.resetInterval = setInterval(resetAnimation, ANIMATION_DURATION);
  }

  private setupBackground() {
    // Créer le div de fond principal (pour la couleur de fond)
    this.background = document.createElement('div');
    this.background.style.position = 'fixed';
    this.background.style.top = '0';
    this.background.style.left = '0';
    this.background.style.width = '100vw';
    this.background.style.height = '100vh';
    this.background.style.zIndex = '-2';
    this.background.style.transition = 'background-color 0.3s ease';
    
    // Créer le div pour l'effet VANTA
    this.vantaBackground = document.createElement('div');
    this.vantaBackground.style.position = 'fixed';
    this.vantaBackground.style.top = '0';
    this.vantaBackground.style.left = '0';
    this.vantaBackground.style.width = '100vw';
    this.vantaBackground.style.height = '100vh';
    this.vantaBackground.style.zIndex = '-1';
    this.vantaBackground.style.backgroundColor = 'transparent';
    
    // Configurer le conteneur
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.zIndex = '-1';
    
    // Ajouter les divs dans le bon ordre
    this.container.appendChild(this.background);
    this.container.appendChild(this.vantaBackground);
    
    // Mettre à jour la couleur de fond initiale
    this.updateBackgroundColor();

    // Observer les changements de thème
    const observer = new MutationObserver(() => {
      this.updateBackgroundColor();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private updateBackgroundColor() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Mettre à jour le fond principal
    this.background.style.backgroundColor = isDarkMode ? '#000000' : '#ffffff';
    
    // Mettre à jour les couleurs de l'effet
    if (this.effect) {
      this.effect.setOptions({
        color: isDarkMode ? 0xff0000 : 0xff1a1a,
        backgroundColor: 'transparent',
        backgroundAlpha: 0
      });
    }
  }

  private initEffect() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const randomParams = this.getRandomParameters();
    
    try {
      this.effect = VANTA({
        el: this.vantaBackground,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: window.innerHeight,
        minWidth: window.innerWidth,
        scale: 1.0,
        color: isDarkMode ? 0xff0000 : 0xff1a1a,
        backgroundColor: 'transparent',
        backgroundAlpha: 0,
        ...randomParams,
        lineWidth: 2.0, // Lignes beaucoup plus épaisses
        quantity: 8, // Plus de connexions
        waveSpeed: 1.5,
        waveHeight: 1.2, // Plus d'amplitude
        colorMode: 'lerpGradient',
        colorGradient: isDarkMode ? [
          [1, 0.2, 0.2],    // Rouge brillant
          [1, 0, 0],        // Rouge pur
          [0.8, 0, 0]       // Rouge foncé
        ] : [
          [1, 0.3, 0.3],    // Rouge très vif
          [1, 0.1, 0.1],    // Rouge brillant
          [1, 0, 0]         // Rouge pur
        ],
        shininess: 80, // Ajout de brillance
        intensity: 5.0, // Intensité plus forte
        opacity: 0.9 // Opacité légèrement réduite pour un effet de brillance
      });
      console.log('Topology effect initialized with params:', randomParams);
    } catch (error) {
      console.error('Failed to initialize topology effect:', error);
    }
  }

  private getRandomParameters() {
    const presets = [
      {
        // Ultra dense et très rapide
        points: 60, // Augmenté
        maxDistance: 25,
        spacing: 4, // Réduit pour plus de densité
        speed: 4.0,
        showDots: true,
        connectionSpeed: 2.5
      },
      {
        // Minimal mais intense
        points: 15,
        maxDistance: 70,
        spacing: 30,
        speed: 3.5,
        showDots: false,
        connectionSpeed: 2.0
      },
      {
        // Réseau chaotique
        points: 45,
        maxDistance: 80,
        spacing: 8,
        speed: 5.0,
        showDots: true,
        connectionSpeed: 3.0
      },
      {
        // Mega constellation
        points: 90,
        maxDistance: 20,
        spacing: 6,
        speed: 4.0,
        showDots: true,
        connectionSpeed: 3.5
      },
      {
        // Lignes longues
        points: 25,
        maxDistance: 120,
        spacing: 20,
        speed: 4.5,
        showDots: false,
        connectionSpeed: 2.8
      },
      {
        // Explosion de points
        points: 120,
        maxDistance: 35,
        spacing: 5,
        speed: 6.0,
        showDots: true,
        connectionSpeed: 4.5
      }
    ];

    // Ajouter une variation aléatoire aux paramètres
    const selectedPreset = presets[Math.floor(Math.random() * presets.length)];
    return {
      ...selectedPreset,
      points: selectedPreset.points + Math.floor(Math.random() * 15 - 7), // ±7 points
      maxDistance: selectedPreset.maxDistance + Math.floor(Math.random() * 15 - 7), // ±7 distance
      spacing: selectedPreset.spacing + Math.floor(Math.random() * 4 - 2), // ±2 spacing
      speed: selectedPreset.speed + (Math.random() * 1.5 - 0.75), // ±0.75 speed
      connectionSpeed: selectedPreset.connectionSpeed + (Math.random() * 0.6 - 0.3) // ±0.3 connection speed
    };
  }

  private handleScroll = () => {
    const currentScrollTop = window.scrollY;
    const delta = Math.abs(currentScrollTop - this.lastScrollTop);
    
    this.scrollVelocity = Math.min(delta * 0.015, 4);
    this.lastScrollTop = currentScrollTop;

    this.targetSpeed = (1.0 + (this.scrollVelocity * 3.5)) * (this.isReversed ? -1 : 1);
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.2;
    
    this.updateEffect(this.currentSpeed);

    if (this.scrollVelocity > 0) {
      this.scrollVelocity *= 0.92;
      this.animationFrameId = requestAnimationFrame(this.updateVelocity);
    } else if (Math.abs(this.currentSpeed) > 1.1) {
      this.animationFrameId = requestAnimationFrame(this.updateVelocity);
    }
  };

  private updateVelocity = () => {
    this.handleScroll();
  };

  private setupScrollHandler() {
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.targetSpeed = this.isReversed ? -1.0 : 1.0;
      this.updateVelocity();
    }, 150);
  }

  private updateEffect(newSpeed: number) {
    if (this.effect && this.effect.options) {
      this.effect.setOptions({
        speed: newSpeed
      });
    }
  }

  public destroy() {
    if (this.effect) {
      this.effect.destroy();
    }
    window.removeEventListener('scroll', this.handleScroll);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }
    if (this.boomerangInterval) {
      clearInterval(this.boomerangInterval);
    }
    
    // Nettoyer les éléments de fond
    if (this.background && this.background.parentNode) {
      this.background.parentNode.removeChild(this.background);
    }
    if (this.vantaBackground && this.vantaBackground.parentNode) {
      this.vantaBackground.parentNode.removeChild(this.vantaBackground);
    }
    
    // Reset container styles
    if (this.container) {
      this.container.style.position = '';
      this.container.style.top = '';
      this.container.style.left = '';
      this.container.style.width = '';
      this.container.style.height = '';
      this.container.style.zIndex = '';
    }
  }
}
