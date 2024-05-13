import { Container } from 'pixi.js';
import type { FxCommand } from '../useFx';
import { clamp } from '@game/shared';

export const attack: FxCommand<'attack'> = (
  { done, session, spriteMap, camera },
  attackerId,
  targetId
) => {
  const attackerSprite = toValue(spriteMap.get(attackerId))?.parent;
  if (!attackerSprite) {
    console.warn(`FXContext: sprite not found for entity ${attackerId}`);
    return done();
  }
  const targetSprite = toValue(spriteMap.get(targetId))?.parent;
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

  // we need to invert the X distance if sprite is flipped
  const attacker = session.entitySystem.getEntityById(attackerId)!;
  let scale = attacker.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    scale *= -1;
  }
  distance.x *= scale;
  distance.x = clamp(distance.x, -80, 80);
  distance.y = clamp(distance.y, -80, 80);

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
