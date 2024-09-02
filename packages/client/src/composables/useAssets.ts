import {
  Assets,
  type AssetsManifest,
  type ISpritesheetData,
  Spritesheet,
  Texture,
  type UnresolvedAsset,
  extensions
} from 'pixi.js';
import type { InjectionKey } from 'vue';
import { BaseTexture, SCALE_MODES } from 'pixi.js';

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

export type SpritesheetWithAnimations = Spritesheet & {
  animations: Record<string, Texture[]>;
};
export type AssetsContext = {
  loaded: Ref<boolean>;
  fullyLoaded: Ref<boolean>;
  loadSpritesheet(key: string): Promise<SpritesheetWithAnimations>;
  loadTexture(key: string): Promise<Texture>;
  loadNormalSpritesheet(
    key: string,
    diffuseSheet: SpritesheetWithAnimations
  ): Promise<SpritesheetWithAnimations>;
  getSpritesheet(key: string): SpritesheetWithAnimations;
  getTexture(key: string): Texture;
  getHitbox(key: string): any;
  load: () => Promise<void>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

const splitBundle = (manifest: AssetsManifest, name: string) => {
  const bundle = manifest.bundles.find(b => b.name === name)!;
  manifest.bundles.splice(manifest.bundles.indexOf(bundle), 1);

  (bundle.assets as UnresolvedAsset[]).forEach(asset => {
    manifest.bundles.push({
      name: asset.alias?.[0] ?? '',
      assets: [asset]
    });
  });
};

const getNormalAssetData = (
  asset: ISpritesheetData,
  imagePath: string
): ISpritesheetData => {
  const animations = Object.fromEntries(
    Object.entries(asset.animations!).map(([key, frames]) => [
      key,
      frames.map(frame => `n_${frame}`)
    ])
  );
  const frames = Object.fromEntries(
    Object.entries(asset.frames).map(([key, frame]) => [`n_${key}`, frame])
  );
  return {
    animations,
    frames,
    meta: { ...asset.meta, image: imagePath }
  };
};

export const useAssetsProvider = () => {
  // means the essentials are loaded and the app is ready to run
  const loaded = ref(false);
  // means that all bundles have been loaded, except units and icons that are lazy loaded. The game screen s ready to be displayed
  const fullyLoaded = ref(false);

  const init = async () => {
    extensions.add(asepriteSpriteSheetParser, asepriteTilesetParser);

    Assets.cache.reset();
    const manifest = await $fetch<AssetsManifest>('/assets/assets-manifest.json');

    // createNormalSheetsBundle(manifest, 'units');
    // transform the manifest to add separate bundles for units and icons, as loading everything at once is way too expensive
    splitBundle(manifest, 'units');
    splitBundle(manifest, 'icons');
    splitBundle(manifest, 'normals');
    splitBundle(manifest, 'fx');
    splitBundle(manifest, 'obstacles');
    Assets.init({ manifest });
  };

  const loadNonCriticalResources = async () => {
    await Promise.all(
      ['tiles', 'obstacles', 'tilesets', 'hitboxes', 'modifiers'].map(bundle => {
        return new Promise(resolve => {
          window.requestIdleCallback(() => {
            Assets.loadBundle(bundle).then(resolve);
          });
        });
      })
    );
    fullyLoaded.value = true;
  };

  const load = async () => {
    if (loaded.value) return;
    await init();
    await Promise.all([Assets.loadBundle('ui'), Assets.loadBundle('pedestals')]);
    loaded.value = true;

    loadNonCriticalResources();
  };

  const bundlesPromises = new Map<string, Promise<any>>();
  const normalPromises = new Map<string, Promise<SpritesheetWithAnimations>>();
  const api: AssetsContext = {
    loaded,
    fullyLoaded,
    load,
    async loadNormalSpritesheet(key: string, diffuseSheet: Spritesheet) {
      const normalKey = `${key}_n`;
      // avoids pixi warning messages when wetry to load a bundle multiple times
      if (!normalPromises.has(normalKey)) {
        normalPromises.set(
          normalKey,
          (async () => {
            const texture = await api.loadTexture(`${normalKey}.png`);
            if (!texture) {
              throw new Error(`Missing normal map: ${normalKey}`);
            }
            const assetData = getNormalAssetData(
              diffuseSheet.data,
              texture.baseTexture.resource.src
            );

            const sheet = new Spritesheet(texture, assetData);
            await sheet.parse();
            return sheet;
          })()
        );
      }
      return normalPromises.get(normalKey)!;
    },
    async loadSpritesheet(key) {
      // avoids pixi warning messages when we try to load a bundle multiple times
      if (!bundlesPromises.has(key)) {
        bundlesPromises.set(key, Assets.loadBundle(key));
      }
      await bundlesPromises.get(key);
      return Assets.get<SpritesheetWithAnimations>(key);
    },
    async loadTexture(key) {
      // avoids pixi warning messages when we try to load a bundle multiple times
      if (!bundlesPromises.has(key)) {
        bundlesPromises.set(key, Assets.loadBundle(key));
      }
      await bundlesPromises.get(key);
      return Assets.get<Texture>(key);
    },
    getSpritesheet(key: string) {
      const sheet = Assets.get<SpritesheetWithAnimations>(key);
      if (!sheet) {
        throw new Error(`Spritesheet not found for ${key}`);
      }
      return sheet;
    },
    getTexture(key: string) {
      return Assets.get<Texture>(key);
    },
    getHitbox(key) {
      return Assets.get<any>(`hitbox-${key}`);
    }
  };

  provide(ASSETS_INJECTION_KEY, api);

  return api;
};

export const useAssets = () => useSafeInject(ASSETS_INJECTION_KEY);
