import { Assets, Spritesheet, extensions } from 'pixi.js';
import type { InjectionKey } from 'vue';
import { ASSET_BUNDLES, assetsManifest } from '../assets/manifest';

export type AssetsContext = {
  getSprite(key: string, falback?: string): Spritesheet;
  load: () => Promise<void>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

export const useAssetsProvider = () => {
  let sprites: Record<string, Spritesheet> = {};

  const load = async () => {
    extensions.add(spriteSheetParser);
    Assets.init({ manifest: assetsManifest });

    const bundles = await Promise.all([
      Assets.loadBundle(ASSET_BUNDLES.TILES),
      Assets.loadBundle(ASSET_BUNDLES.UI),
      Assets.loadBundle(ASSET_BUNDLES.UNITS)
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
