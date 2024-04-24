import type { FxCommand } from '../useFx';

export const moveEntity: FxCommand<'moveEntity'> = (
  { entityPositionsMap, done },
  entityId,
  path
) => {
  const position = entityPositionsMap.value.get(entityId);
  if (!position) {
    console.warn('Position not registered for entity', entityId);
    return done();
  }

  const timeline = gsap.timeline({
    onComplete() {
      done();
    }
  });

  for (const { point, duration } of path) {
    timeline.to(position, {
      ...point,
      duration,
      ease: Power0.easeNone
    });
  }

  timeline.play();
};
