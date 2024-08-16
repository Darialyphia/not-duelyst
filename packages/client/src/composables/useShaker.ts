import type { Container } from 'pixi.js';
import type { Ref } from 'vue';

export interface ShakeProps {
  isBidirectional: boolean; // shake X and Y - if false only shakes X
  shakeCountMax: number; // how many times to repeat shake
  shakeAmount: number; // the variance of the shake in pixels I.e. 10 would shake a random number of pixels between -5 and 5
  shakeDelay: number; // the delay between each shake repeat in milliseconds
}

export const useShaker = (container: Ref<Container | undefined>) => {
  const state = {
    isBidirectional: true,
    shakeCountMax: 10,
    shakeAmount: 6,
    shakeDelay: 25,
    isShaking: false,
    shakeCount: 0
  };

  const trigger = (shakeProps?: ShakeProps): void => {
    if (!container.value) return;

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
      container.value.position.set(0, 0);
      state.shakeCount = 0;
      state.isShaking = false;
    } else {
      container.value.position.set(
        Math.floor(Math.random() * state.shakeAmount) - state.shakeAmount / 2,
        state.isBidirectional
          ? Math.floor(Math.random() * state.shakeAmount) - state.shakeAmount / 2
          : undefined
      );
      setTimeout(() => trigger(), state.shakeDelay);
    }
  };
  return { trigger };
};
