import { Text, Container } from 'pixi.js';
import type { FxCommand } from '../useFx';

export const displayDamageIndicator: FxCommand<'displayDamageIndicator'> = (
  { ui, spriteMap, entityRootMap, done },
  from,
  to,
  amount
) => {
  const fromSprite = toValue(spriteMap.get(from));
  if (!fromSprite) {
    console.warn(`FXContext: sprite not found for entity ${from}`);
    return done();
  }
  const toSprite = toValue(spriteMap.get(to));
  if (!toSprite) {
    console.warn(`FXContext: sprite not found for entity ${to}`);
    return done();
  }

  const root = entityRootMap.get(to);

  if (!root) {
    console.warn(`FXContext: entity root container not found for entity ${to}`);
    return done();
  }

  const container = new Container();

  const textSprite = new Text(String(amount), {
    fontSize: 40,
    fontWeight: '700',
    fill: 0xff0000,
    stroke: 'black',
    strokeThickness: 4
  });

  const direction =
    fromSprite.toGlobal(fromSprite.position).x <= toSprite.toGlobal(toSprite.position).x
      ? 1
      : -1;

  const path = [
    { x: 0, y: -10, alpha: 1, scale: 0.5 },
    { x: direction * 30, y: -50, alpha: 1, scale: 1 },
    { x: direction * 60, y: -10, alpha: 1, scale: 1 },
    { x: direction * 80, y: 6, alpha: 0, scale: 1 }
  ];
  container.addChild(textSprite);
  // gsap motionpath doesn't work with gsap pixi plugin, so we apply values to a dummy object and update the text on update
  const sentinel = Object.assign({ x: 0, y: 0, scale: 1, alpha: 1 }, path.shift()!);

  const onUpdate = () => {
    textSprite.position.set(sentinel.x, sentinel.y);
    // we divide the scale by 2 to avoid pixelated text since the game is zoomed in by default
    textSprite.scale.set(sentinel.scale * 0.5, sentinel.scale * 0.5);
    textSprite.alpha = sentinel.alpha;
  };
  onUpdate(); // set starting values on sprite

  ui.assignLayer(container, 'ui');
  root.addChild(container);
  gsap.to(sentinel, {
    motionPath: {
      path
    },
    duration: 2,
    onUpdate,
    ease: Power2.easeOut,
    onComplete: () => {
      container.destroy();
      done();
    }
  });
};
