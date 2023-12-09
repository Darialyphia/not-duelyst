import { type ResolverManifest } from 'pixi.js';
import { tileSpritesPaths } from './tiles';
import { objectEntries, type Values } from '@hc/shared';
import { uiSpritesPaths } from './ui';
import { unitSpritesPaths } from './units';
import { tilesetsPaths } from './tilesets';

export const ASSET_BUNDLES = {
  TILES: 'tiles',
  UI: 'sprites',
  UNITS: 'units',
  TILESETS: 'tilesets'
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
      name: ASSET_BUNDLES.TILESETS,
      assets: objectEntries(tilesetsPaths).map(([name, srcs]) => ({
        name,
        srcs
      }))
    }
  ]
} satisfies ResolverManifest;
