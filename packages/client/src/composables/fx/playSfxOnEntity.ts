import { AnimatedSprite } from 'pixi.js';
import type { FxCommand } from '../useFx';

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

export const playSfxOnEntity: FxCommand<'playSfxOnEntity'> = async (
  { assets, session, entityRootMap, done },
  entityId,
  { resourceName, animationName, offset, delay }
) => {
  const entity = session.entitySystem.getEntityById(entityId);
  if (!entity) {
    console.warn(`FXContext: entity not found for entityId ${entityId}`);
    return done();
  }

  const root = await waitUntil(() => toValue(entityRootMap.get(entityId)));

  const sheet = await assets.loadSpritesheet(resourceName);

  const textures = createSpritesheetFrameObject(animationName, sheet);
  const fx = new AnimatedSprite(textures);
  fx.anchor.set(0.5, 0);
  fx.loop = false;
  fx.position.set(offset?.x ?? 0, offset?.y ?? 0);
  fx.onComplete = () => {
    fx.destroy();
    done();
  };

  setTimeout(() => {
    root?.addChild(fx);
    fx.gotoAndPlay(0);
  }, delay);
};
