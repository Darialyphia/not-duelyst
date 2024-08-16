import { waitFor } from '@game/shared';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import type { DisplayObject } from 'pixi.js';
import type { Ref } from 'vue';

export const useBloom = (displayObject: Ref<DisplayObject | undefined>) => {
  const bloom = new AdvancedBloomFilter();
  bloom.brightness = 1;

  const trigger = async ({
    strength,
    duration
  }: {
    strength: number;
    duration: number;
  }) => {
    if (!displayObject.value) return;
    displayObject.value.filters ??= [];
    displayObject.value.filters.push(bloom);
    bloom.threshold = 0.9;
    bloom.bloomScale = 0;

    gsap.to(bloom, {
      threshold: 0.4,
      bloomScale: strength,
      duration: 0.4
    });
    bloom.threshold = 0.4;

    await waitFor(duration);
    gsap.to(bloom, {
      threshold: 0.9,
      bloomScale: 0,
      duration: 0.4,
      onComplete() {
        displayObject.value!.filters?.splice(
          displayObject.value!.filters.indexOf(bloom),
          1
        );
      }
    });
  };

  return { trigger };
};
