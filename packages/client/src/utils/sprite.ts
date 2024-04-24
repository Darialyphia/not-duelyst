import type { FrameObject, Spritesheet } from 'pixi.js';

// matches textures from an animation to its duration in the sprite sheet data
export const createSpritesheetFrameObject = (
  name: string,
  spritesheet: Spritesheet
): FrameObject[] => {
  const frames = spritesheet.data.animations?.[name];
  const textures = spritesheet.animations[name];
  if (!frames || !textures) throw new Error(`unknown animation: ${name}`);

  const defaultDuration = 100;
  return frames.map((frame, index) => {
    return {
      texture: textures[index],
      // @ts-ignore bruh
      time: spritesheet.data.frames[frame].duration ?? defaultDuration
    };
  });
};

export const SPRITE_ZINDEX_OFFSETS = {
  INTERACTABLE: 2,
  HOVERED_CELL: 1.5,
  ENTITY: 2.1,
  HALF_TILE: -1
} as const;
