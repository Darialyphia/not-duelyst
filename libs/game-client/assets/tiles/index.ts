const tileSpritesGlobs = import.meta.glob('./*.png', { eager: true });

export const tileSpritesPaths = Object.fromEntries(
  Object.entries(tileSpritesGlobs).map(([key, module]) => {
    return [
      key.replace('./', '').replace('.png', ''),
      (module as { default: string }).default
    ];
  })
);
