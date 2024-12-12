import React, { useRef, useEffect, useCallback } from 'react';
import { useBackground } from '../contexts/BackgroundContext';
import { initAnimation, destroyAnimation } from '../animations';
import type { AnimationTheme } from '../animations';

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

const MIN_HALOS = 5;
const MAX_HALOS = 8;
const MIN_LIFE_TIME = 8000;
const MAX_LIFE_TIME = 15000;
const FADE_IN_DURATION = 1000;
const FADE_OUT_DURATION = 2000;
const SCROLL_SENSITIVITY = 0.4; 
const BASE_WAVE_SPEED = 0.0008; 
const SIZE_CHANGE_SPEED = 0.001; 
const DEFORM_BASE_SPEED = 0.001; 
const BASE_MOVEMENT_SPEED = 0.015; 
const BOUNDARY_MARGIN = 300; // Marge autour de l'écran en pixels

interface Boundary {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showAnimation, animationTheme } = useBackground();
  const isDarkMode = useRef(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const animationFrameRef = useRef<number>();
  const halos = useRef<Halo[]>([]);
  const lastTime = useRef<number>(0);
  const nextId = useRef<number>(0);
  const boundary = useRef<Boundary>({
    left: -BOUNDARY_MARGIN,
    right: window.innerWidth + BOUNDARY_MARGIN,
    top: -BOUNDARY_MARGIN,
    bottom: window.innerHeight + BOUNDARY_MARGIN
  });

  const createHalo = useCallback((spawnAtEdge = false): Halo => {
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
    const saturation = isDarkMode.current 
      ? (85 + Math.random() * 15)  // Mode sombre: 85-100%
      : (90 + Math.random() * 10); // Mode clair: 90-100%
    const lightness = isDarkMode.current
      ? (20 + Math.random() * 30)  // Mode sombre: 20-50%
      : (35 + Math.random() * 25); // Mode clair: 35-60%
    const baseOpacity = Math.random() < 0.3 
      ? (isDarkMode.current ? (0.8 + Math.random() * 0.2) : (0.85 + Math.random() * 0.15))  // Halos plus visibles
      : (isDarkMode.current ? (0.3 + Math.random() * 0.3) : (0.4 + Math.random() * 0.3));   // Halos plus subtils

    const now = performance.now();
    return {
      id: nextId.current++,
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
      blur: isDarkMode.current ? (40 + Math.random() * 100) : (30 + Math.random() * 80),
      lifeTime: 0,
      maxLife: MIN_LIFE_TIME + Math.random() * (MAX_LIFE_TIME - MIN_LIFE_TIME),
      birthTime: now,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: BASE_WAVE_SPEED * (0.8 + Math.random() * 0.4),
      amplitude: 0.5 + Math.random() * 1.5,
      frequency: 0.3 + Math.random() * 0.7,
      secondaryPhase: Math.random() * Math.PI * 2
    };
  }, []);

  const initHalos = useCallback(() => {
    const initialCount = Math.floor((MIN_HALOS + MAX_HALOS) / 2);
    halos.current = Array(initialCount).fill(null).map(() => createHalo(false));
  }, [createHalo]);

  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    boundary.current = {
      left: -BOUNDARY_MARGIN,
      right: window.innerWidth + BOUNDARY_MARGIN,
      top: -BOUNDARY_MARGIN,
      bottom: window.innerHeight + BOUNDARY_MARGIN
    };
  }, []);

  const updateHalo = useCallback((halo: Halo, deltaTime: number, scrollSpeed: number = 0) => {
    const now = performance.now();
    
    const speedMultiplier = 1 + (scrollSpeed * 1.5);
    halo.x += halo.vx * deltaTime * speedMultiplier;
    halo.y += halo.vy * deltaTime * speedMultiplier;

    const bounceSpeedRetention = 0.8;
    
    if (halo.x - halo.size/2 < boundary.current.left) {
      halo.x = boundary.current.left + halo.size/2;
      halo.vx = Math.abs(halo.vx) * bounceSpeedRetention;
    } else if (halo.x + halo.size/2 > boundary.current.right) {
      halo.x = boundary.current.right - halo.size/2;
      halo.vx = -Math.abs(halo.vx) * bounceSpeedRetention;
    }

    if (halo.y - halo.size/2 < boundary.current.top) {
      halo.y = boundary.current.top + halo.size/2;
      halo.vy = Math.abs(halo.vy) * bounceSpeedRetention;
    } else if (halo.y + halo.size/2 > boundary.current.bottom) {
      halo.y = boundary.current.bottom - halo.size/2;
      halo.vy = -Math.abs(halo.vy) * bounceSpeedRetention;
    }

    const chaosAmount = 0.00015 * (1 + scrollSpeed * 1.5);
    halo.vx += (Math.random() - 0.5) * chaosAmount * deltaTime;
    halo.vy += (Math.random() - 0.5) * chaosAmount * deltaTime;

    const maxSpeed = 0.3 * (1 + scrollSpeed * 1.5);
    const currentSpeed = Math.sqrt(halo.vx * halo.vx + halo.vy * halo.vy);
    if (currentSpeed > maxSpeed) {
      halo.vx = (halo.vx / currentSpeed) * maxSpeed;
      halo.vy = (halo.vy / currentSpeed) * maxSpeed;
    }

    const deformSpeedMultiplier = 1 + (scrollSpeed * 0.5);
    halo.deformPhase += halo.deformSpeed * deltaTime * deformSpeedMultiplier;
    const deform = Math.sin(halo.deformPhase) * halo.deformAmount;

    // Gestion plus dynamique de la taille
    const sizeChangeMultiplier = 1 + (scrollSpeed * 0.3);
    const sizeDiff = halo.targetSize - halo.size;
    if (Math.abs(sizeDiff) > 1) {
      halo.size += sizeDiff * SIZE_CHANGE_SPEED * deltaTime * sizeChangeMultiplier;
    } else {
      // Nouvelle taille cible plus variée
      const expansionFactor = Math.random() < 0.3 ? 2.5 : 1.5;
      halo.targetSize = halo.baseSize * (0.4 + Math.random() * expansionFactor);
    }

    const baseOpacity = parseFloat(halo.color.split(',')[3]);
    halo.opacity = baseOpacity;

    return halo;
  }, []);

  const renderHalo = useCallback((ctx: CanvasRenderingContext2D, halo: Halo) => {
    const [hue, saturation, lightness] = halo.color.split('(')[1].split(')')[0].split(',').map(v => parseFloat(v));
    
    const deform = Math.sin(halo.deformPhase) * halo.deformAmount;
    const currentSize = Math.max(1, halo.size * (1 + deform)); // Ensure minimum size of 1
    
    const radius = Math.max(0.1, currentSize / 2); // Ensure minimum radius of 0.1
    const gradient = ctx.createRadialGradient(halo.x, halo.y, 0, halo.x, halo.y, radius);
    gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${halo.opacity})`);
    gradient.addColorStop(0.4, `hsla(${hue}, ${saturation}%, ${lightness}%, ${halo.opacity * 0.6})`);
    gradient.addColorStop(0.7, `hsla(${hue}, ${saturation}%, ${lightness}%, ${halo.opacity * 0.3})`);
    gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

    ctx.filter = `blur(${halo.blur}px)`;
    ctx.beginPath();
    ctx.fillStyle = gradient;
    
    const scaleX = 1 + deform * 0.5;
    const scaleY = 1 - deform * 0.5;
    ctx.save();
    ctx.translate(halo.x, halo.y);
    ctx.scale(scaleX, scaleY);
    ctx.arc(0, 0, currentSize / 2, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();
}, []);

  const animate = useCallback(() => {
    if (!canvasRef.current || !showAnimation) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const now = performance.now();
    const deltaTime = now - lastTime.current;
    lastTime.current = now;

    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - (window._lastScrollY || 0));
    const scrollSpeed = Math.min(scrollDelta * 0.3, 35);
    window._lastScrollY = currentScrollY;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    while (halos.current.length < MIN_HALOS) {
      halos.current.push(createHalo(true));
    }

    halos.current.forEach(halo => {
      updateHalo(halo, deltaTime, scrollSpeed);
    });

    ctx.filter = 'none';
    halos.current.forEach(halo => renderHalo(ctx, halo));

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [createHalo, updateHalo, renderHalo, showAnimation]);

  useEffect(() => {
    if (!containerRef.current || !showAnimation) return;

    // Initialiser l'animation avec le thème actuel
    initAnimation(containerRef.current, animationTheme as AnimationTheme);

    // Cleanup function
    return () => {
      initAnimation(containerRef.current!, 'none');
    };
  }, [animationTheme, showAnimation]); // Dépendances pour réinitialiser l'animation quand le thème change

  useEffect(() => {
    if (!showAnimation) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      destroyAnimation();
      return;
    }

    if (['smoke', 'topology'].includes(animationTheme) && containerRef.current) {
      initAnimation(containerRef.current, animationTheme as AnimationTheme);
    } else {
      destroyAnimation();
      handleResize();
      initHalos();
      lastTime.current = performance.now();
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      destroyAnimation();
    };
  }, [showAnimation, animationTheme, handleResize, initHalos, animate]);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const isDark = document.documentElement.classList.contains('dark');
      
      // Reset background color
      container.style.backgroundColor = '';
      
      // Set background color for specific themes
      if (animationTheme === 'topology') {
        container.style.backgroundColor = isDark ? '#000000' : '#ffffff';
        container.style.opacity = '1';
      }
    }
  }, [animationTheme]);

  if (!showAnimation) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{
        background: 'none',
        pointerEvents: 'none'
      }}
    >
      {!['smoke', 'topology'].includes(animationTheme) && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      )}
    </div>
  );
};

export default Background;
