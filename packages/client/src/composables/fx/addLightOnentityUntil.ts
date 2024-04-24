import { AnimatedSprite } from 'pixi.js';
import type { FxCommand } from '../useFx';
import { PointLight } from '@pixi/lights';

const waitUntil = <T>(cond: () => T) => {
  return new Promise<T>(resolve => {
    const interval = setInterval(() => {
      const val = cond();
      if (val) {
        clearInterval(interval);
        resolve(val);
      }
    }, 50);
  });
};

export const addLightOnEntityUntil: FxCommand<'addLightOnEntityUntil'> = (
  { session, entityRootMap },
  entityId,
  { color, strength, offset }
) => {
  const entity = session.entitySystem.getEntityById(entityId);
  if (!entity) {
    console.warn(`FXContext: entity not found for entityId ${entityId}`);
    return () => void 0;
  }

  const root = entityRootMap.get(entityId);
  const light = new PointLight(color, strength);
  light.position.set(offset?.x ?? 0, offset?.y ?? 0);
  light.alpha = 0;
  root?.addChild(light);
  gsap.to(light, {
    pixi: {
      alpha: 1
    },
    duration: 0.3
  });

  return () => {
    gsap.to(light, {
      pixi: {
        alpha: 0
      },
      duration: 0.3,
      onComplete() {
        light.destroy();
      }
    });
  };
};
