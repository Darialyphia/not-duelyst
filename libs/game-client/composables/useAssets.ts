import { Assets, Spritesheet, Texture, extensions } from 'pixi.js';
import type { InjectionKey } from 'vue';
import { ASSET_BUNDLES, assetsManifest } from '../assets/manifest';

export type AssetsContext = {
  getSprite(
    key: string,
    falback?: string
  ): Spritesheet & { animations: Record<string, Texture[]> };
  load: () => Promise<void>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

export const useAssetsProvider = () => {
  const sprites: Record<string, Spritesheet & { animations: Record<string, Texture[]> }> =
    {};

  const load = async () => {
    extensions.add(asepriteSpriteSheetParser, asepriteTilesetParser);

    Assets.init({ manifest: assetsManifest });

    const bundles = await Promise.all([
      Assets.loadBundle(ASSET_BUNDLES.TILES),
      Assets.loadBundle(ASSET_BUNDLES.UI),
      Assets.loadBundle(ASSET_BUNDLES.UNITS),
      Assets.loadBundle(ASSET_BUNDLES.TILESETS),
      Assets.loadBundle(ASSET_BUNDLES.INTERACTABLES),
      Assets.loadBundle(ASSET_BUNDLES.FX)
    ]);

    bundles.forEach(bundle => {
      Object.assign(sprites, bundle);
    });
  };

  const api = {
    load,
    getSprite(key: string, fallback?: string) {
      const sprite = sprites[key];
      if (!sprite && fallback) return sprites[fallback];
      if (!sprite) {
        throw new Error(`Unknown sprite: ${key} and no fallback specified.`);
      }
      return sprite;
    }
  };

  provide(ASSETS_INJECTION_KEY, api);

  return api;
};

export const useAssets = () => useSafeInject(ASSETS_INJECTION_KEY);
