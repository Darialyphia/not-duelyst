import type { FxCommand } from '../useFx';

export const shakeEntity: FxCommand<'shakeEntity'> = (
  { session, spriteMap, done },
  entityId,
  { count = 5, totalDuration = 1, axis = 'x', amount = 10 } = {}
) => {
  const entity = session.entitySystem.getEntityById(entityId);
  if (!entity) {
    console.warn(`FXContext: entity not found for entityId ${entityId}`);
    return done();
  }

  const sprite = toValue(spriteMap.get(entityId));
  if (!sprite) {
    console.warn(`FXContext: sprite not found for entity ${entityId}`);
    return done();
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
        done();
      },
      repeat: count,
      pixi: {
        x: axis === 'x' || axis === 'both' ? -amount : 0,
        y: axis === 'y' || axis === 'both' ? -amount : 0
      }
    }
  );
};
