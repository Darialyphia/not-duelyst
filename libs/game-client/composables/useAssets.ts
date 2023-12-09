import { Assets, Spritesheet, extensions } from 'pixi.js';
import type { InjectionKey } from 'vue';
import { ASSET_BUNDLES, assetsManifest } from '../assets/manifest';

export type AssetsContext = {
  getSprite(key: string): Spritesheet;
  load: () => Promise<void>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

export const useAssetsProvider = () => {
  let sprites: Record<string, Spritesheet>;

  const load = async () => {
    extensions.add(spriteSheetParser);
    Assets.init({ manifest: assetsManifest });

    const [tiles, ui] = await Promise.all([
      Assets.loadBundle(ASSET_BUNDLES.TILES),
      Assets.loadBundle(ASSET_BUNDLES.UI)
    ]);

    sprites = { ...ui, ...tiles };
  };

  const api = {
    load,
    getSprite(key: string) {
      return sprites[key];
    }
  };

  provide(ASSETS_INJECTION_KEY, api);

  return api;
};

export const useAssets = () => useSafeInject(ASSETS_INJECTION_KEY);
