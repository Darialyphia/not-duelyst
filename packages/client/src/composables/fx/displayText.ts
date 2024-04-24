import { Text, Container } from 'pixi.js';
import type { FxCommand } from '../useFx';

export const displayText: FxCommand<'displayText'> = (
  { ui, spriteMap, entityRootMap, done },
  text,
  entityId,
  { color, path, duration }
) => {
  const sprite = toValue(spriteMap.get(entityId));
  if (!sprite) {
    console.warn(`FXContext: sprite not found for entity ${entityId}`);
    return done();
  }
  const root = entityRootMap.get(entityId);
  if (!root) {
    console.warn(`FXContext: entity root container not found for entity ${entityId}`);
    return done();
  }

  const container = new Container();

  const textSprite = new Text(text, {
    fontSize: 30,
    fontWeight: '700',
    fill: color,
    stroke: 'black',
    strokeThickness: 4
  });

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
    duration,
    onUpdate,
    ease: Power2.easeOut,
    onComplete: () => {
      container.destroy();
      done();
    }
  });
};
