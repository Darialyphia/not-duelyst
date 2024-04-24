import type { FxCommand } from '../useFx';

export const playAnimationUntil: FxCommand<'playAnimationUntil'> = (
  { entityAnimationsMap, done },
  entityId,
  animationName
) => {
  const current = entityAnimationsMap.value.get(entityId)!;
  entityAnimationsMap.value.set(entityId, animationName);
  return () => {
    entityAnimationsMap.value.set(entityId, current);
    done();
  };
};
