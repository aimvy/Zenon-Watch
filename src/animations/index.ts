import { SmokeEffect } from './smoke';
import { TopologyEffect } from './topology';
import { HalosEffect } from './halos';

export type AnimationTheme = 'halos' | 'smoke' | 'topology';

let currentEffect: SmokeEffect | TopologyEffect | HalosEffect | null = null;

export const initAnimation = (container: HTMLElement, theme: AnimationTheme) => {
  if (currentEffect) {
    currentEffect.destroy();
    currentEffect = null;
  }

  switch (theme) {
    case 'smoke':
      currentEffect = new SmokeEffect(container);
      break;
    case 'halos':
      currentEffect = new HalosEffect(container);
      break;
    case 'topology':
      currentEffect = new TopologyEffect(container);
      break;
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
