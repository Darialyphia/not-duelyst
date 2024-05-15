import type { FxCommand } from '../useFx';

export const fadeOutEntity: FxCommand<'fadeOutEntity'> = (
  { done, entityRootMap },
  entityId,
  duration
) => {
  const root = entityRootMap.get(entityId);

  if (!root) {
    console.warn(`FXContext: entity root container not found for entity ${entityId}`);
    return done();
  }

  gsap.to(root, {
    pixi: { alpha: 0 },
    duration,
    onComplete: done
  });
};
