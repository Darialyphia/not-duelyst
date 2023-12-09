const tileSpritesGlobs = import.meta.glob('./*.json', { as: 'url', eager: true });

export const tileSpritesPaths = Object.fromEntries(
  Object.entries(tileSpritesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.json', ''), module];
  })
);
