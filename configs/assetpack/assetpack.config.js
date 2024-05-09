import { compressPng } from "@assetpack/plugin-compress";
import { audio } from "@assetpack/plugin-ffmpeg";
import { json } from "@assetpack/plugin-json";
import { pixiManifest } from "@assetpack/plugin-manifest";
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
};

const prefixByAssetType = {
  tilesets: "",
  skills: "",
  units: "",
  icons: "",
  tiles: "",
  ui: "",
  obstacles: "",
  fx: "",
  normals: "",
  modifiers: "",
  pedestals: "",
  hitboxes: "hitbox-",
  emotes: "",
};

function manifestEntryParser(tree, processor) {
  const transformData = SavableAssetCache.get(tree.path).transformData;

  const res = transformData.files.map((file) => {
    const name = processor.trimOutputPath(file.name ?? file.paths[0]);

    const assetType = name.split("/")[0];

    const assetName = name.split("/").at(-1);
    const prefix = prefixByAssetType[assetType];
    const stripExtension = name.endsWith(".json");
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
      audio: audio(),
      json: json(),
      manifest: pixiManifest({
        output: `${output}/assets-manifest.json`,
        trimExtensions: false,
        parsers: [{ type: "copy", parser: manifestEntryParser }],
      }),
    },
  };
}
