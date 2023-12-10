import type { GameSession, GameState } from '@hc/sdk';

export const useInstallFxContext = ({ gameSession, state, fx, assets }: GameContext) => {
  gameSession.fxContext = {
    playAnimationOnce(
      entityId,
      animationName,
      { animationNameFallback = 'idle', framePercentage = 1 } = {}
    ) {
      return new Promise<void>(resolve => {
        const entity = gameSession.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(fx.spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }

        const sheet = assets.getSprite(entity.unitId, 'placeholder');
        const hasAnimation = !!sheet.animations[animationName];
        if (!hasAnimation) {
          console.warn(
            `FXContext: animation not found on sprite : ${animationName}. Using fallback ${animationNameFallback}`
          );
          return resolve();
        }

        sprite.textures = createSpritesheetFrameObject(
          hasAnimation ? animationName : animationNameFallback,
          sheet
        );
        sprite.loop = false;
        sprite.gotoAndPlay(0);

        sprite.onFrameChange = frame => {
          if (frame > sprite.totalFrames * framePercentage) {
            resolve();
            sprite.onFrameChange = undefined;
          }
        };

        sprite.onComplete = () => {
          sprite.textures = createSpritesheetFrameObject('idle', sheet);
          sprite.loop = true;
          sprite.gotoAndPlay(0);
          sprite.onComplete = undefined;
          sprite.onFrameChange = undefined;
          resolve();
        };

        if (framePercentage === 0) {
          resolve();
        }
      });
    },

    playAnimationUntil(entityId, animationName, { animationNameFallback = 'idle' } = {}) {
      const entity = gameSession.entityManager.getEntityById(entityId);
      if (!entity) {
        console.warn(`FXContext: entity not found for entityId ${entityId}`);
        return () => {};
      }

      const sprite = toValue(fx.spriteMap.get(entityId));
      if (!sprite) {
        console.warn(`FXContext: sprite not found for entity ${entityId}`);
        return () => {};
      }

      const sheet = assets.getSprite(entity.unitId, 'placeholder');
      sheet.animations;
      const hasAnimation = !!sheet.animations[animationName];
      if (!hasAnimation) {
        console.warn(
          `FXContext: animation not found on sprite : ${animationName}. Using fallback ${animationNameFallback}`
        );
        return () => {};
      }

      sprite.textures = createSpritesheetFrameObject(
        hasAnimation ? animationName : animationNameFallback,
        sheet
      );
      sprite.loop = true;
      sprite.gotoAndPlay(0);

      return () => {
        sprite.textures = createSpritesheetFrameObject('idle', sheet);
        sprite.loop = true;
        sprite.gotoAndPlay(0);
      };
    },

    moveEntity(entityId, point, duration) {
      return new Promise<void>(resolve => {
        fx.isMoving.value = true;
        // wwe are grabbing the entity from the reactive state instead of entityManager otherwise the movement won't be rendered !
        // It's ok because the position wil be updated when the action execution is flushed after the fx sequence
        const entity = state.value.entities.find(e => e.id === entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        entity.position.x = point.x;
        entity.position.y = point.y;
        entity.position.z = point.z;

        setTimeout(() => {
          fx.isMoving.value = false;
          resolve();
        }, duration);
      });
    },

    shakeEntity(
      entityId,
      { count = 5, totalDuration = 1, axis = 'x', amount = 10 } = {}
    ) {
      console.log(count, totalDuration, axis, amount);
      return new Promise(resolve => {
        fx.isMoving.value = true;
        const entity = gameSession.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(fx.spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }

        const { x, y } = sprite.position;
        gsap.fromTo(
          sprite,
          {
            pixi: {
              x: axis === 'x' || axis === 'both' ? amount : 0,
              y: axis === 'y' || axis === 'both' ? amount : 0
            }
          },
          {
            duration: totalDuration / count,
            ease: Power0.easeNone,
            yoyo: true,
            onComplete: () => {
              sprite.position.x = x;
              sprite.position.y = y;
              resolve();
            },
            repeat: count,
            pixi: {
              x: axis === 'x' || axis === 'both' ? -amount : 0,
              y: axis === 'y' || axis === 'both' ? -amount : 0
            }
          }
        );
      });
    }
  };
};
