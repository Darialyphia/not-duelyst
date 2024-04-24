import type { FxCommand } from '../useFx';

export const attack: FxCommand<'attack'> = (
  { done, spriteMap },
  attackerId,
  targetId
) => {
  const attackerSprite = toValue(spriteMap.get(attackerId));
  if (!attackerSprite) {
    console.warn(`FXContext: sprite not found for entity ${attackerId}`);
    return done();
  }
  const targetSprite = toValue(spriteMap.get(targetId));
  if (!targetSprite) {
    console.warn(`FXContext: sprite not found for entity ${targetId}`);
    return done();
  }

  const attackerPosition = attackerSprite.toGlobal(attackerSprite.position);
  const targetPosition = targetSprite.toGlobal(targetSprite.position);

  const distance = {
    x: attackerPosition.x - targetPosition.x,
    y: attackerPosition.y - targetPosition.y
  };

  const timeline = gsap.timeline();
  timeline.to(attackerSprite, {
    pixi: {
      x: distance.x / 10,
      y: distance.y / 10
    },
    duration: 0.05,
    ease: Power0.easeNone
  });
  timeline.to(attackerSprite, {
    pixi: {
      x: -distance.x / 3,
      y: -distance.y / 3
    },
    duration: 0.1,
    ease: Power0.easeNone,
    onComplete() {
      done();
    }
  });
  timeline.to(attackerSprite, {
    pixi: {
      x: 0,
      y: 0
    },
    duration: 0.3,
    ease: Power1.easeOut
  });

  timeline.play();
};
