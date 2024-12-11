import React, { useEffect, useRef, useCallback } from 'react';
import { useBackground } from '../contexts/BackgroundContext';

interface Halo {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  deform: number;
  color: string;
  opacity: number;
  speed: number;
  phase: number;
}

const Background: React.FC = () => {
  const { showHalos } = useBackground();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastScrollY = useRef<number>(0);
  const halos = useRef<Halo[]>([]);
  const time = useRef<number>(0);

  // Initialisation des halos
  const initHalos = useCallback(() => {
    const newHalos: Halo[] = [];
    
    // Configuration des différents types de halos
    const configs = [
      { count: 2, size: 400, speed: 0.00004, opacity: 0.035 },  // Moyens, plus intenses
      { count: 2, size: 300, speed: 0.00005, opacity: 0.025 },  // Petits, plus diffus
    ];

    // Initialisation avec espacement
    const initHaloPosition = (index: number, total: number) => {
      // Divise l'écran en sections pour une meilleure distribution
      const sectionWidth = window.innerWidth / (total + 1);
      const sectionHeight = window.innerHeight / (total + 1);
      
      return {
        x: sectionWidth * (index + 1) + (Math.random() - 0.5) * sectionWidth * 0.8,
        y: sectionHeight * (index + 1) + (Math.random() - 0.5) * sectionHeight * 0.8
      };
    };

    let haloIndex = 0;
    configs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        const position = initHaloPosition(haloIndex, configs.reduce((sum, c) => sum + c.count, 0));
        haloIndex++;

        const hue = 0; // Rouge
        const saturation = 70 + Math.random() * 30;
        const lightness = 45 + Math.random() * 10;

        newHalos.push({
          x: position.x,
          y: position.y,
          vx: 0,
          vy: 0,
          size: config.size,
          baseSize: config.size,
          deform: 0,
          color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${config.opacity})`,
          opacity: config.opacity,
          speed: config.speed,
          phase: Math.random() * Math.PI * 2
        });
      }
    });

    halos.current = newHalos;
  }, []);

  // Animation principale
  const animate = useCallback((currentTime: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mise à jour du temps
    time.current += 0.001;

    // Effet de traînée plus prononcé
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calcul du multiplicateur de vitesse basé sur le scroll
    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
    const scrollMultiplier = Math.min(scrollDelta * 0.8, 20); // Réduction significative de la réactivité
    lastScrollY.current = currentScrollY;

    // Mise à jour et rendu des halos
    halos.current.forEach(halo => {
      const t = time.current + halo.phase;
      
      // Mouvements de base plus prononcés même au repos
      const baseMovement = 0.2; // Mouvement minimal au repos
      const moveX = (
        Math.sin(t * 0.2) * Math.cos(t * 0.5) * 1.5 +
        Math.sin(t * 0.1) * 1.0 +
        Math.cos(t * 0.3) * Math.sin(t * 0.2) * 1.2 +
        baseMovement * Math.sin(t * 0.05)  // Mouvement lent supplémentaire
      ) * (1 + scrollMultiplier * 0.05);

      const moveY = (
        Math.cos(t * 0.3) * Math.sin(t * 0.4) * 1.5 +
        Math.cos(t * 0.15) * 1.0 +
        Math.sin(t * 0.25) * Math.cos(t * 0.3) * 1.2 +
        baseMovement * Math.cos(t * 0.06)  // Mouvement lent supplémentaire
      ) * (1 + scrollMultiplier * 0.05);
      
      // Vitesse de base plus élevée
      const baseSpeed = halo.speed * 2;  // Doublé la vitesse de base
      const effectiveSpeed = baseSpeed * (1 + scrollMultiplier * 20);
      
      // Application du mouvement avec plus d'inertie au repos
      const restInertia = 0.005; // Inertie plus faible au repos pour des mouvements plus fluides
      const scrollInertia = 0.02; // Inertie plus forte pendant le défilement
      const currentInertia = restInertia + (scrollInertia - restInertia) * (scrollMultiplier / 20);
      
      halo.vx += (moveX * effectiveSpeed - halo.vx) * currentInertia;
      halo.vy += (moveY * effectiveSpeed - halo.vy) * currentInertia;
      
      halo.x += halo.vx * window.innerWidth * 0.08;
      halo.y += halo.vy * window.innerHeight * 0.08;

      // Repositionnement intelligent avec espacement minimum
      const margin = halo.size;
      const minDistance = 400; // Distance minimale entre les halos

      const repositionHalo = () => {
        const visibleHalos = halos.current.filter(h => 
          h.x > 0 && h.x < window.innerWidth && 
          h.y > 0 && h.y < window.innerHeight
        );

        if (visibleHalos.length < 2) { // Garantir au moins 2 halos visibles
          let newX, newY;
          let attempts = 0;
          const maxAttempts = 10;

          do {
            if (halo.x < 0) {
              newX = window.innerWidth - margin;
              newY = Math.random() * window.innerHeight;
            } else if (halo.x > window.innerWidth) {
              newX = margin;
              newY = Math.random() * window.innerHeight;
            } else if (halo.y < 0) {
              newX = Math.random() * window.innerWidth;
              newY = window.innerHeight - margin;
            } else {
              newX = Math.random() * window.innerWidth;
              newY = margin;
            }

            // Vérifie la distance avec les autres halos
            const tooClose = visibleHalos.some(h => {
              const dx = newX - h.x;
              const dy = newY - h.y;
              return Math.sqrt(dx * dx + dy * dy) < minDistance;
            });

            if (!tooClose) {
              halo.x = newX;
              halo.y = newY;
              break;
            }

            attempts++;
          } while (attempts < maxAttempts);
        }
      };

      if (halo.x < -margin || halo.x > window.innerWidth + margin ||
          halo.y < -margin || halo.y > window.innerHeight + margin) {
        repositionHalo();
      }

      // Déformation plus prononcée même au repos
      const baseDeform = 0.1; // Déformation minimale au repos
      const deformPhase = t * 0.2 + halo.phase;  // Ralenti la fréquence de déformation
      const deformAmount = (
        baseDeform + 
        Math.sin(deformPhase) * 0.2 + 
        Math.sin(deformPhase * 0.5) * 0.1
      ) * (1 + scrollMultiplier * 0.1);
      
      halo.deform += (deformAmount - halo.deform) * 0.02;

      // Variation de taille plus prononcée au repos
      const baseSizeVariation = 0.05; // Variation minimale de taille au repos
      const sizeVariation = 1 + (
        baseSizeVariation * Math.sin(t * 0.1 + halo.phase) +
        Math.sin(t * 0.2 + halo.phase) * 0.1
      ) * (1 + scrollMultiplier * 0.02);
      
      // Rendu avec plus de flou
      ctx.beginPath();
      ctx.fillStyle = halo.color;
      ctx.filter = 'blur(40px)';
      
      // Forme organique
      const xRadius = halo.baseSize * sizeVariation * (1 + halo.deform);
      const yRadius = halo.baseSize * sizeVariation * (1 - halo.deform);
      
      ctx.ellipse(
        halo.x,
        halo.y,
        xRadius,
        yRadius,
        Math.sin(t + halo.phase) * Math.PI,
        0,
        Math.PI * 2
      );
      
      ctx.fill();
      ctx.filter = 'none';
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Gestion du redimensionnement
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  // Setup initial et cleanup
  useEffect(() => {
    if (!canvasRef.current) return;

    handleResize();
    initHalos();
    animationFrameRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, handleResize, initHalos]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: showHalos ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

export default Background;
