import type { FrameObject, Spritesheet, Texture } from 'pixi.js';

// matches textures from an animation to its duration in the sprite sheet data
export const createSpritesheetFrameObject = (
  name: string,
  spritesheet: Spritesheet
): Texture[] => {
  const frames = spritesheet.data.animations?.[name];
  const textures = spritesheet.animations[name];
  if (!frames || !textures) throw new Error(`unknown animation: ${name}`);

  return frames.map((frame, index) => {
    return {
      texture: textures[index],
      // @ts-ignore bruh
      time: spritesheet.data.frames[frame].duration
    };
  }) as unknown as Texture[]; // waiting on https://github.com/hairyf/vue3-pixi/pull/81 to be released
};
