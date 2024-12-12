import { SmokeEffect } from './smoke';
import { TopologyEffect } from './topology';

export type AnimationTheme = 'halos' | 'smoke' | 'topology';

let currentEffect: SmokeEffect | TopologyEffect | null = null;

export const initAnimation = (container: HTMLElement, theme: AnimationTheme) => {
  if (currentEffect) {
    currentEffect.destroy();
    currentEffect = null;
  }

  switch (theme) {
    case 'smoke':
      currentEffect = new SmokeEffect(container);
      break;
    case 'topology':
      currentEffect = new TopologyEffect(container);
      break;
    case 'halos':
    default:
      break;
  }
};

export const destroyAnimation = () => {
  if (currentEffect) {
    currentEffect.destroy();
    currentEffect = null;
  }
};
