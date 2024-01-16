const unitSpritesGlobs = import.meta.glob('./*.json', { as: 'url', eager: true });
export const unitSpritesPaths = Object.fromEntries(
  Object.entries(unitSpritesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.json', ''), module];
  })
);

const unitImagesGlobs = import.meta.glob('./*.png', { as: 'url', eager: true });
export const unitImagesPaths = Object.fromEntries(
  Object.entries(unitImagesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.png', ''), module];
  })
);
