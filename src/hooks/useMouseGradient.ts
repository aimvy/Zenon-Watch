import { useEffect } from 'react';

export const useMouseGradient = () => {
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const elements = document.querySelectorAll('.red-element');
      
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        (element as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (element as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
};
