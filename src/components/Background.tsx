import { useEffect, useRef } from "react";
import { useBackground } from '../contexts/BackgroundContext';

interface BlobBehavior {
  speedMultiplier: number;
  sizeChangeRate: number;
  rotationSpeed: number;
  deformationIntensity: number;
  responsiveness: number;
}

const Background = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement[]>([]);
  const positionsRef = useRef<{
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    rotation: number;
    scale: number;
    targetScale: number;
    behavior: BlobBehavior;
  }[]>([]);
  const lastScrollY = useRef(0);
  const scrollVelocity = useRef(0);
  const { showHalos } = useBackground();

  const generateRandomBehavior = (): BlobBehavior => {
    const type = Math.random();
    if (type < 0.2) {
      // Halos rapides (20%)
      return {
        speedMultiplier: 0.00005 + Math.random() * 0.0001, // Quasi immobile au repos
        sizeChangeRate: 0.02 + Math.random() * 0.03, // Changements minimes au repos
        rotationSpeed: 0.005 + Math.random() * 0.01,
        deformationIntensity: 0.02 + Math.random() * 0.03, // Déformations minimes au repos
        responsiveness: 8 + Math.random() * 4, // Beaucoup plus réactif au défilement
      };
    } else if (type < 0.5) {
      // Halos moyens (30%)
      return {
        speedMultiplier: 0.00002 + Math.random() * 0.00005,
        sizeChangeRate: 0.015 + Math.random() * 0.02,
        rotationSpeed: 0.002 + Math.random() * 0.005,
        deformationIntensity: 0.015 + Math.random() * 0.02,
        responsiveness: 6 + Math.random() * 3,
      };
    } else {
      // Halos lents (50%)
      return {
        speedMultiplier: 0.00001 + Math.random() * 0.00002,
        sizeChangeRate: 0.01 + Math.random() * 0.015,
        rotationSpeed: 0.001 + Math.random() * 0.002,
        deformationIntensity: 0.01 + Math.random() * 0.015,
        responsiveness: 4 + Math.random() * 2,
      };
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updatePositions = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity.current = Math.abs(currentScrollY - lastScrollY.current) * 0.15; // Augmenté pour plus de réactivité au scroll
      lastScrollY.current = currentScrollY;

      positionsRef.current.forEach((pos, index) => {
        const blob = blobsRef.current[index];
        if (!blob) return;

        // Multiplicateur de vitesse beaucoup plus important lors du défilement
        const scrollSpeedMultiplier = 1 + (scrollVelocity.current * pos.behavior.responsiveness * 5);
        const effectiveSpeed = pos.behavior.speedMultiplier * scrollSpeedMultiplier;

        // Mise à jour des positions avec easing
        pos.x += (pos.targetX - pos.x) * effectiveSpeed;
        pos.y += (pos.targetY - pos.y) * effectiveSpeed;

        // Rotation et échelle réduites au repos, amplifiées lors du défilement
        const rotationSpeed = pos.behavior.rotationSpeed * scrollSpeedMultiplier;
        pos.rotation += rotationSpeed * 0.02;
        
        const scaleSpeed = pos.behavior.sizeChangeRate * scrollSpeedMultiplier;
        pos.scale += (pos.targetScale - pos.scale) * scaleSpeed * 0.02;

        // Changement de direction moins fréquent au repos
        const distanceToTarget = Math.hypot(pos.targetX - pos.x, pos.targetY - pos.y);
        const changeDirectionChance = 0.0002 + (scrollVelocity.current * 0.001);
        if (distanceToTarget < 1 || Math.random() < changeDirectionChance) {
          const margin = window.innerWidth * 0.3;
          pos.targetX = -margin + Math.random() * (window.innerWidth + margin * 2);
          pos.targetY = -margin + Math.random() * (window.innerHeight + margin * 2);
          
          const minDistance = Math.min(window.innerWidth, window.innerHeight) * 0.5;
          let attempts = 0;
          while (Math.hypot(pos.targetX - pos.x, pos.targetY - pos.y) < minDistance && attempts < 10) {
            pos.targetX = -margin + Math.random() * (window.innerWidth + margin * 2);
            pos.targetY = -margin + Math.random() * (window.innerHeight + margin * 2);
            attempts++;
          }

          pos.targetScale = 0.6 + Math.random() * 0.8;
        }

        // Déformation réduite au repos, amplifiée lors du défilement
        const deformationAmount = 0.05 + (scrollVelocity.current * 0.3);
        const deformation = 1 + (Math.sin(Date.now() * 0.001 * pos.behavior.deformationIntensity) * deformationAmount);
        blob.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg) scale(${pos.scale * deformation}, ${pos.scale / deformation})`;
      });

      requestAnimationFrame(updatePositions);
    };

    // Initialisation
    const numBlobs = 25;
    blobsRef.current = [];
    positionsRef.current = [];

    for (let i = 0; i < numBlobs; i++) {
      const blob = document.createElement('div');
      const size = 300 + Math.random() * 1000;
      blob.className = 'absolute rounded-full bg-gradient-to-br from-red-500/30 to-red-600/30 dark:from-red-500/10 dark:to-red-600/10 mix-blend-screen blur-2xl';
      blob.style.width = `${size}px`;
      blob.style.height = `${size}px`;
      container.appendChild(blob);
      blobsRef.current.push(blob);

      const behavior = generateRandomBehavior();
      const margin = window.innerWidth * 0.3;
      positionsRef.current.push({
        x: -margin + Math.random() * (window.innerWidth + margin * 2),
        y: -margin + Math.random() * (window.innerHeight + margin * 2),
        targetX: -margin + Math.random() * (window.innerWidth + margin * 2),
        targetY: -margin + Math.random() * (window.innerHeight + margin * 2),
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.8,
        targetScale: 0.6 + Math.random() * 0.8,
        behavior,
      });
    }

    updatePositions();

    return () => {
      blobsRef.current.forEach(blob => blob.remove());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-500" 
      style={{ 
        zIndex: -1,
        background: 'transparent',
        opacity: showHalos ? 1 : 0
      }}
    />
  );
};

export default Background;
