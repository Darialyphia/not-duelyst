import type { Ref } from 'vue';
import { ShockwaveFilter } from '@pixi/filter-shockwave';
import { DisplayObject, Point } from 'pixi.js';
import { onTick, useApplication } from 'vue3-pixi';
import { waitFor } from '@game/shared';

export const useShockwave = (
  displayObject: Ref<DisplayObject | undefined>,
  getCenter: (offset: { x: number; y: number }) => Point
) => {
  const shockwave = new ShockwaveFilter();
  shockwave.speed = 500;
  shockwave.amplitude = 30;
  shockwave.brightness = 1;

  const app = useApplication();
  const { camera } = useGame();

  let shockwaveDuration = 2.5;
  onTick(() => {
    shockwave.time += app.value.ticker.elapsedMS / 1000;
    shockwave.time %= shockwaveDuration;
  });

  const trigger = async ({
    offset,
    duration,
    radius,
    wavelength
  }: {
    offset?: { x: number; y: number };
    duration: number;
    radius: number;
    wavelength: number;
  }) => {
    if (!displayObject.value) return;
    shockwave.center = getCenter(offset ?? { x: 0, y: 0 });
    shockwave.wavelength = wavelength;
    shockwave.radius = radius * camera.viewport.value!.scale.x;

    shockwave.time = 0;
    shockwaveDuration = duration / 1000;

    displayObject.value.filters ??= [];
    displayObject.value.filters.push(shockwave);

    await waitFor(duration);
    displayObject.value.filters?.splice(
      displayObject.value.filters.indexOf(shockwave),
      1
    );
  };

  return { trigger };
};
