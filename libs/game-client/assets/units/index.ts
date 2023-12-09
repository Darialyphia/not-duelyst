const unitSpritesGlobs = import.meta.glob('./*.json', { as: 'url', eager: true });

export const unitSpritesPaths = Object.fromEntries(
  Object.entries(unitSpritesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.json', ''), module];
  })
);
