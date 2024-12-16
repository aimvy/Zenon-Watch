import React, { useEffect } from 'react';
import ZENON_FAV from '../assets/Zenon-FAV.svg';
import '../styles/loading.css';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadingComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-zenon-light-bg dark:bg-zenon-dark-bg z-50 flex items-center justify-center">
      <div className="relative w-32 h-32">
        <img 
          src={ZENON_FAV} 
          alt="ZENON"
          className="w-full h-full loading-logo z-10 relative"
        />
        <div className="absolute inset-0 -m-4">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 opacity-20 loading-circle" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-red-500 opacity-20 loading-circle-reverse" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
