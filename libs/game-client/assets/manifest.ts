import { tileSpritesPaths } from './tiles';
import { objectEntries, type Values } from '@hc/shared';
import { uiSpritesPaths } from './ui';
import { unitSpritesPaths } from './units';
import { tilesetsPaths } from './tilesets';
import { fxSpritesPaths } from './fx';
import { sfxPaths } from './sfx';
import { INTERACTABLES } from '@hc/sdk';
import { interactableSpritesPaths } from './interactables';

export const ASSET_BUNDLES = {
  TILES: 'tiles',
  UI: 'sprites',
  UNITS: 'units',
  TILESETS: 'tilesets',
  FX: 'fx',
  SFX: 'sfx',
  INTERACTABLES: 'interactables'
} as const;

export type AssetBundle = Values<typeof ASSET_BUNDLES>;

export const assetsManifest = {
  bundles: [
    {
      name: ASSET_BUNDLES.TILES,
      assets: objectEntries(tileSpritesPaths).map(([name, srcs]) => ({
        name,
        srcs
      }))
    },
    {
      name: ASSET_BUNDLES.UI,
      assets: objectEntries(uiSpritesPaths).map(([name, srcs]) => ({
        name,
        srcs
      }))
    },
    {
      name: ASSET_BUNDLES.UNITS,
      assets: objectEntries(unitSpritesPaths).map(([name, srcs]) => ({
        name,
        srcs
      }))
    },
    {
      name: ASSET_BUNDLES.INTERACTABLES,
      assets: objectEntries(interactableSpritesPaths).map(([name, srcs]) => ({
        name,
        srcs
      }))
    },
    {
      name: ASSET_BUNDLES.TILESETS,
      assets: objectEntries(tilesetsPaths).map(([name, srcs]) => ({
        name,
        srcs
      }))
    },
    {
      name: ASSET_BUNDLES.FX,
      assets: objectEntries(fxSpritesPaths).map(([name, srcs]) => ({
        name,
        srcs
      }))
    }
  ]
};
