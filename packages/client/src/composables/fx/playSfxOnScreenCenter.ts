import { AnimatedSprite, Graphics } from 'pixi.js';
import type { FxCommand } from '../useFx';
import { Viewport } from 'pixi-viewport';

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

export const playSfxOnScreenCenter: FxCommand<'playSfxOnScreenCenter'> = async (
  { assets, camera, done },
  { resourceName, animationName, offset = { x: 0, y: 0 }, delay }
) => {
  const root = camera.viewport.value;
  if (!root) throw new Error('Viewport not available.');
  const sheet = await assets.loadSpritesheet(resourceName);

  const textures = createSpritesheetFrameObject(animationName, sheet);
  const fx = new AnimatedSprite(textures);
  fx.anchor.set(0.5, 0.5);
  fx.zIndex = 9999;
  fx.zOrder = 9999;
  fx.loop = false;

  fx.position.set(root.center.x + offset?.x, root.center.y + offset.y);

  fx.onComplete = () => {
    fx.destroy();
    done();
  };

  setTimeout(() => {
    root?.addChild(fx);
    fx.gotoAndPlay(0);
  }, delay);
};
