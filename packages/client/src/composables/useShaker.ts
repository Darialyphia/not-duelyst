import type { Container } from 'pixi.js';

type Target = Container[] | Container;

export interface ShakeProps {
  isBidirectional: boolean; // shake X and Y - if false only shakes X
  shakeCountMax: number; // how many times to repeat shake
  shakeAmount: number; // the variance of the shake in pixels I.e. 10 would shake a random number of pixels between -5 and 5
  shakeDelay: number; // the delay between each shake repeat in milliseconds
}

// Default props which can optionally be set on newShaker function / factory
export interface DefaultShakeProps extends ShakeProps {
  target?: Target;
}

export const useShaker = (
  defaults?: DefaultShakeProps
): {
  shake: (shakeProps?: ShakeProps) => void;
  setTarget: (shakeTarger: Target) => void;
} => {
  // set optional default state
  const defaultState = defaults
    ? defaults
    : {
        target: null,
        isBidirectional: true,
        shakeCountMax: 10,
        shakeAmount: 6,
        shakeDelay: 25
      };
  // Populate state from default props and fixed defaults
  const state = {
    ...defaultState,
    isShaking: false,
    shakeCount: 0
  };

  /**
   * Set the target to shake on the state
   * @param shakeTarget - a valid display object or array of display objects / PIXI.Container(s)
   */
  const setTarget = (shakeTarget: Target) => {
    state.target = shakeTarget;
  };

  /**
   * Shorthand function to reposition a display object
   * @param target - a valid display object
   * @param pos - an object containing optional x and y coordinates
   */
  const reposition = (target: Container, pos: { x?: number; y?: number }): void => {
    target.position.set(pos.x ?? target.x, pos.y ?? target.y);
  };

  const shake = (shakeProps?: ShakeProps): void => {
    if (!state.target) return;

    // override defaults w/ new props if they're set, we'll use defaults set in factory creation otherwise
    if (shakeProps) {
      state.shakeCountMax = shakeProps.shakeCountMax;
      state.shakeAmount = shakeProps.shakeAmount;
      state.shakeDelay = shakeProps.shakeDelay;
    }

    if (!state.isShaking) {
      state.isShaking = true;
      state.shakeCount = 0;
    }
    state.shakeCount++;
    if (state.shakeCount > state.shakeCountMax) {
      if (Array.isArray(state.target)) {
        state.target.forEach(element => {
          reposition(element, { x: 0, y: 0 });
        });
      } else {
        reposition(state.target, { x: 0, y: 0 });
      }
      state.shakeCount = 0;
      state.isShaking = false;
    } else {
      if (Array.isArray(state.target)) {
        state.target.forEach(element => {
          reposition(element, {
            x: Math.floor(Math.random() * state.shakeAmount) - state.shakeAmount / 2
          });

          if (state.isBidirectional) {
            reposition(element, {
              y: Math.floor(Math.random() * state.shakeAmount) - state.shakeAmount / 2
            });
          }
        });
      } else {
        reposition(state.target, {
          x: Math.floor(Math.random() * state.shakeAmount) - state.shakeAmount / 2
        });
        if (state.isBidirectional) {
          reposition(state.target, {
            y: Math.floor(Math.random() * state.shakeAmount) - state.shakeAmount / 2
          });
        }
      }

      // Recurse via timeout
      setTimeout(() => shake(), state.shakeDelay);
    }
  };
  return { shake, setTarget };
};
