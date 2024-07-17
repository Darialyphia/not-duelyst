import fs from 'fs-extra';
import path from 'path';
import fg from 'fast-glob';
import plist from 'plist';
import { exec } from 'child_process';
import { promisify } from 'util';

type PlistFrame = {
  frame: string;
  offset: string;
  rotated: boolean;
  sourceColorRect: string;
  sourceSize: string;
};
type PlistSchema = {
  frames: Record<string, PlistFrame>;
  metadata: {
    format: number;
    size: string;
    textureFileName: string;
  };
};

const execAsync = promisify(exec);

const parsePlistValue = (str: string) => {
  if (!str.startsWith('{')) return str;

  return JSON.parse(str.replaceAll('{', '[').replaceAll('}', ']'));
};

const parsePlist = (url: string, raw: string) => {
  const json = plist.parse(raw) as PlistSchema;
  const urlParts = url.split('/');
  const filename = urlParts.at(-1)!.replace('.plist', '');

  const parsedSize = parsePlistValue(json.metadata.size) as [number, number];

  const animations: Record<string, number[]> = {};

  Object.keys(json.frames).forEach((key, index) => {
    const parts = key.replace(`${filename}_`, '').split('_');

    const name = parts.at(-2) ?? 'default'; // spells and artifacts dont have an animation name for their "default" state
    if (!animations[name]) {
      animations[name] = [];
    }
    animations[name].push(index);
  });

  const frameTags = Object.entries(animations).map(([name, frames]) => ({
    name,
    from: Math.min(...frames),
    to: Math.max(...frames),
    direction: 'forwards',
    color: '#000000ff'
  }));

  return {
    frames: Object.entries(json.frames).map(([key, value]) => {
      const parsedFrame = parsePlistValue(value.frame) as [
        [number, number],
        [number, number]
      ];
      const parsedOffset = parsePlistValue(value.offset) as [number, number];
      const parsedSourceSize = parsePlistValue(value.sourceSize) as [number, number];
      return {
        filename: key.replace('.png', ''),
        frame: {
          x: parsedFrame[0][0] + parsedOffset[0],
          y: parsedFrame[0][1] + parsedOffset[1],
          w: parsedFrame[1][0],
          h: parsedFrame[1][1]
        },
        rotated: value.rotated,
        trimmed: false,
        spriteSourceSize: {
          x: 0,
          y: 0,
          w: parsedSourceSize[0],
          h: parsedSourceSize[1]
        },
        sourceSize: {
          w: parsedSourceSize[0],
          h: parsedSourceSize[1]
        },
        duration: 64
      };
    }),
    meta: {
      app: 'https://www.aseprite.org/',
      image: `${filename}.png`,
      scale: '1',
      size: { w: parsedSize[0], h: parsedSize[1] },
      frameTags
    }
  };
};

(async function () {
  const paths = await fg('src/assets/duelyst/units/*.plist');
  const outDir = path.join(process.cwd(), 'src/assets/duelyst/aseprite');
  await fs.ensureDir(outDir);
  for (const p of paths) {
    const file = await fs.readFileSync(path.join(process.cwd(), p), {
      encoding: 'utf-8'
    });

    const name = p.replace('.plist', '').split('/').at(-1);

    const as = (newExt: string) => p.replace('.plist', `.${newExt}`);

    const imageExists = await fs.exists(path.join(process.cwd(), as('png')));
    if (!imageExists) {
      console.log(`Skipping ${name}: spritesheet not found`);
      continue;
    }
    const parsed = parsePlist(p, file);
    await fs.writeJSON(as('json'), parsed, {
      spaces: 2,
      encoding: 'utf-8'
    });

    try {
      await execAsync(
        `aseprite ${path.join(process.cwd(), as('png'))} --script-param json="${path.join(process.cwd(), as('json'))}" --script "${path.join(process.cwd(), '../../jest_import_packed_atlas.lua')}" --batch`
      );

      await fs.move(
        path.join(process.cwd(), p.replace('.plist', '.ase')),
        path.join(outDir, `${name}.ase`)
      );
    } catch (err) {
      console.log(`Error while generating ${name}`);
    } finally {
      console.log(`Generated Aseprite file for ${name}`);
    }
  }
})();
