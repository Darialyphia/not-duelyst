import type { Viewport } from 'pixi-viewport';
import type { InjectionKey } from 'vue';

export type RotationAngle = 0 | 90 | 180 | 270;

export type IsoCameraContext = {
  angle: Ref<RotationAngle>;
  offset: Ref<{ x: number; y: number }>;
  viewport: Ref<Viewport | null>;
  rotateCW(): void;
  rotateCCW(): void;
};
const ISOCAMERA_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<IsoCameraContext>;

export const useIsoCameraProvider = () => {
  const api: IsoCameraContext = {
    angle: ref(0),
    offset: ref({ x: 0, y: 0 }),
    viewport: ref(null),
    rotateCW() {
      api.angle.value = ((api.angle.value + 360 + 90) % 360) as RotationAngle;
    },
    rotateCCW() {
      api.angle.value = ((api.angle.value + 360 - 90) % 360) as RotationAngle;
    }
  };

  provide(ISOCAMERA_INJECTION_KEY, api);

  return api;
};

export const useIsoCamera = () => useSafeInject(ISOCAMERA_INJECTION_KEY);
