import { compressPng } from "@assetpack/plugin-compress";
import { audio } from "@assetpack/plugin-ffmpeg";
import { json } from "@assetpack/plugin-json";
import { pixiManifest } from "@assetpack/plugin-manifest";
import { mipmap } from "@assetpack/plugin-mipmap";

import { path, SavableAssetCache } from "@assetpack/core";

const SPRITESHEET_PARSER = "Aseprite_spritesheet_Parser";
const TILESET_PARSER = "Aseprite_tileset_Parser";

const loadParserByAssetType = {
  tilesets: TILESET_PARSER,
  skills: SPRITESHEET_PARSER,
  units: SPRITESHEET_PARSER,
  icons: SPRITESHEET_PARSER,
  tiles: SPRITESHEET_PARSER,
  ui: SPRITESHEET_PARSER,
  obstacles: SPRITESHEET_PARSER,
  fx: SPRITESHEET_PARSER,
  modifiers: SPRITESHEET_PARSER,
  pedestals: SPRITESHEET_PARSER,
  hitboxes: undefined,
  emotes: undefined,
  portraits: undefined,
};

const prefixByAssetType = {
  tilesets: "",
  skills: "",
  units: "",
  icons: "icon-",
  tiles: "",
  ui: "",
  obstacles: "",
  fx: "",
  normals: "",
  modifiers: "",
  pedestals: "",
  hitboxes: "hitbox-",
  emotes: "",
  portraits: "portraits-"
};

function manifestEntryParser(tree, processor) {
  const transformData = SavableAssetCache.get(tree.path).transformData;

  const res = transformData.files.map((file) => {
    const name = processor.trimOutputPath(file.name ?? file.paths[0]);

    const assetType = name.split("/")[0];

    const assetName = name.split("/").at(-1);
    const prefix = prefixByAssetType[assetType];
    const stripExtension = name.endsWith(".json") ||assetType === 'icons';
    const needsCustomParser = name.endsWith(".json");

    const res = {
      alias: prefix + (stripExtension ? path.trimExt(assetName) : assetName),
      src: file.paths.map(
        (path) => `/assets/${processor.trimOutputPath(path)}`
      ),
      loadParser: needsCustomParser
        ? loadParserByAssetType[assetType]
        : undefined,
    };

    file.data && (res.data = file.data);

    return res;
  });

  return res;
}

export default function (entry, output) {
  return {
    entry,
    output,
    ignore: ["**/*.ts", "**/*.aseprite"],
    cache: false,
    plugins: {
      audio: audio({
        inputs: [".mp3",  ".wav"],
        outputs: [
          {
            formats: [".mp3"],
            recompress: true,
            options: {
              audioBitrate: 96,
              audioChannels: 1,
              audioFrequency: 48000,
            },
          },
          {
            formats: [".ogg"],
            recompress: true,
            options: {
              audioBitrate: 32,
              audioChannels: 1,
              audioFrequency: 22050,
            },
          },
        ],
      }),
      json: json(),
      // mipmap: mipmap({ resolutions: { default: 1, "2x": 2 } }),
      manifest: pixiManifest({
        output: `${output}/assets-manifest.json`,
        trimExtensions: false,
        parsers: [{ type: "copy", parser: manifestEntryParser }],
      }),
    },
  };
}
