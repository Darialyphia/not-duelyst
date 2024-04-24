import type { FxCommand } from '../useFx';

export const playAnimation: FxCommand<'playAnimation'> = (
  { assets, spriteMap, session, entityAnimationsMap, done },
  entityId,
  animationName,
  { framePercentage = 1 } = {}
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

  const sheet = assets.getSpritesheet(entity.card.blueprint.spriteId);
  const hasAnimation = !!sheet.animations[animationName];
  if (!hasAnimation) {
    console.warn(
      `FXContext: animation not found on sprite : ${animationName}. Available animations are ${Object.keys(sheet.animations).join(', ')}`
    );
    return () => {
      done();
    };
  }
  const current = entityAnimationsMap.value.get(entityId)!;

  entityAnimationsMap.value.set(entityId, animationName);
  sprite.onFrameChange = frame => {
    if (frame >= (sprite.totalFrames - 1) * framePercentage) {
      sprite.onFrameChange = undefined;
      entityAnimationsMap.value.set(entityId, current);
      done();
    }
  };
};
