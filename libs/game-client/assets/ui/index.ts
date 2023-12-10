const uiSpritesGlobs = import.meta.glob('./*.json', { as: 'url', eager: true });
export const uiSpritesPaths = Object.fromEntries(
  Object.entries(uiSpritesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.json', ''), module];
  })
);
