import type { Nullable } from '@game/shared';
import type { FrameObject } from 'pixi.js';

export const useIlluminatedTexture = (
  textureId: MaybeRefOrGetter<Nullable<string>>,
  animationName: MaybeRefOrGetter<string>
): { diffuse: Nullable<FrameObject[]>; normal: Nullable<FrameObject[]> } => {
  const { assets } = useGame();

  const textures = reactive<{
    diffuse: Nullable<FrameObject[]>;
    normal: Nullable<FrameObject[]>;
  }>({
    normal: null,
    diffuse: null
  }) as { diffuse: Nullable<FrameObject[]>; normal: Nullable<FrameObject[]> };

  watch(
    [() => toValue(textureId), () => toValue(animationName)],
    async ([id, name]) => {
      if (!id) {
        textures.diffuse = null;
        textures.normal = null;
        return;
      }

      const diffuseSheet = await assets.loadSpritesheet(id);

      const normalSheet = await assets.loadNormalSpritesheet(id, diffuseSheet);

      textures.diffuse = createSpritesheetFrameObject(name, diffuseSheet);
      textures.normal = createSpritesheetFrameObject(name, normalSheet);
    },
    { immediate: true }
  );

  return textures;
};
