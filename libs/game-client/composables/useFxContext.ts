import type { GameSession, GameState } from '@hc/sdk';
import { AnimatedSprite } from 'pixi.js';
import { Sound } from '@pixi/sound';
import { sfxPaths } from '../assets/sfx';
import { Howl } from 'howler';

export const useInstallFxContext = ({ gameSession, state, fx, assets }: GameContext) => {
  gameSession.fxContext = {
    playSoundOnce(
      soundId,
      { fallback, percentage = 1, slice = [0, 0] as [number, number] } = {}
    ) {
      return new Promise<void>(resolve => {
        const soundPath = sfxPaths[soundId] ?? sfxPaths[fallback ?? ''];
        if (!soundPath) {
          console.log(`FXContext: sound not found: ${soundId}, fallback ${fallback}`);
          return resolve();
        }

        const sfx = new Howl({
          src: [soundPath],
          volume: 0.5,
          onplay() {
            const durationSeconds = sfx.duration();

            setTimeout(
              () => {
                resolve();
              },
              durationSeconds * 1000 * percentage
            );
          }
        });

        sfx.play(slice ? 'slice' : undefined);
      });
    },

    playSoundUntil(soundId, { fallback, slice = [0, 0] as [number, number] } = {}) {
      const soundPath = sfxPaths[soundId] ?? sfxPaths[fallback ?? ''];
      if (!soundPath) {
        console.log(`FXContext: sound not found: ${soundId}, fallback ${fallback}`);
        return () => {};
      }

      const sfx = new Howl({
        src: [soundPath],
        sprite: {
          slice
        },
        volume: 0.5,
        loop: true,
        onplay() {
          console.log(sfx.duration());
        }
      });

      sfx.play(slice ? 'slice' : undefined);

      return () => {
        sfx.on('end', () => {
          sfx.stop();
        });
      };
    },

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

        const sheet = assets.getSprite(entity.unitId, 'placeholder-unit');
        const animation =
          sheet.animations[animationName] ?? sheet.animations[animationNameFallback];
        if (!animation) {
          console.warn(
            `FXContext: animation not found on sprite ${entity.unitId}: ${animationName}.`
          );
          return resolve();
        }

        sprite.textures = createSpritesheetFrameObject(
          sheet.animations[animationName] ? animationName : animationNameFallback,
          sheet
        );
        sprite.loop = false;
        sprite.gotoAndPlay(0);

        sprite.onFrameChange = frame => {
          if (frame >= sprite.totalFrames * framePercentage) {
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

      const sheet = assets.getSprite(entity.unitId, 'placeholder-unit');
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
    },

    fadeOutEntity(entityId, duration) {
      return new Promise(resolve => {
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

        gsap.to(sprite, {
          duration,
          ease: Power2.easeOut,
          onComplete: resolve,
          pixi: {
            alpha: 0
          }
        });
      });
    },

    addChildSprite(
      spriteId,
      entityId,
      {
        animationName = 'idle',
        offset = { x: 0, y: 0 },
        waitUntilAnimationDone = true,
        scale = 1
      } = {}
    ) {
      return new Promise(resolve => {
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

        const sheet = assets.getSprite(spriteId);
        const hasAnimation = !!sheet.animations[animationName];
        if (!hasAnimation) {
          console.warn(
            `FXContext: animation not found on sprite ${spriteId} : ${animationName}.`
          );
          return resolve();
        }

        const fxSprite = new AnimatedSprite(createSpritesheetFrameObject('idle', sheet));
        fxSprite.position.set(offset.x, offset.y);
        fxSprite.loop = false;
        fxSprite.anchor.set(0.5);
        fxSprite.scale = { x: scale, y: scale };
        fxSprite.onComplete = () => {
          fxSprite.destroy();
          resolve();
        };

        sprite?.addChild(fxSprite);
        fxSprite.play();

        if (!waitUntilAnimationDone) {
          resolve();
        }
      });
    }
  };
};
