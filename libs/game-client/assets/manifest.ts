import { tileSpritesPaths } from './tiles{m}';
import { objectEntries, type Values } from '@hc/shared';
import { uiSpritesPaths } from './ui{m}';
import { unitSpritesPaths } from './units{m}';
import { tilesetsPaths } from './tilesets{m}';
import { fxSpritesPaths } from './fx{m}';
import { interactableSpritesPaths } from './interactables{m}';
import type { AssetsManifest } from 'pixi.js';

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

export const assetsManifest: AssetsManifest = {
  bundles: [
    {
      name: ASSET_BUNDLES.TILES,
      assets: objectEntries(tileSpritesPaths).map(([alias, src]) => ({
        alias,
        src,
        loadParser: ASEPRITE_SPRITESHEET_PARSER
      }))
    },
    {
      name: ASSET_BUNDLES.UI,
      assets: objectEntries(uiSpritesPaths).map(([alias, src]) => ({
        alias,
        src,
        loadParser: ASEPRITE_SPRITESHEET_PARSER
      }))
    },
    {
      name: ASSET_BUNDLES.UNITS,
      assets: objectEntries(unitSpritesPaths).map(([alias, src]) => ({
        alias,
        src,
        loadParser: ASEPRITE_SPRITESHEET_PARSER
      }))
    },
    {
      name: ASSET_BUNDLES.INTERACTABLES,
      assets: objectEntries(interactableSpritesPaths).map(([alias, src]) => ({
        alias,
        src,
        loadParser: ASEPRITE_SPRITESHEET_PARSER
      }))
    },
    {
      name: ASSET_BUNDLES.TILESETS,
      assets: objectEntries(tilesetsPaths).map(([alias, src]) => ({
        alias,
        src,
        loadParser: ASEPRITE_TILESET_PARSER
      }))
    },
    {
      name: ASSET_BUNDLES.FX,
      assets: objectEntries(fxSpritesPaths).map(([alias, src]) => ({
        alias,
        src,
        loadParser: ASEPRITE_SPRITESHEET_PARSER
      }))
    }
  ]
};
