import plist from 'plist';
import fs from 'fs-extra';
// import raw from '../src/assets/totally_not_manaforger.json';
import path from 'path';

const raw = {} as any;
const frames = Object.fromEntries(
  raw.frames.map((frame: any) => {
    const [name, frameNumber] = frame.filename.split('.');
    const key = `${name}_${frameNumber.padStart(3, '0')}.png`;

    return [
      key,
      {
        frame: `{{${frame.frame.x},${frame.frame.y}},{${frame.frame.w},${frame.frame.h}}}`,
        offset: `{0,0}`,
        rotated: false,
        sourceColorRect: `{{0,0},{${frame.frame.w},${frame.frame.h}}}`,
        sourceSize: `{${frame.frame.w},${frame.frame.h}}`
      }
    ];
  })
);

const metadata = {
  format: 2,
  size: `{${raw.meta.size.w},${raw.meta.size.h}}`,
  textureFileName: raw.meta.image
};

const OUTPUT_DIR = path.join(process.cwd(), 'tmp');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'totally-not-manaforger.plist');
await fs.ensureDir(OUTPUT_DIR);
fs.writeFile(OUTPUT_PATH, plist.build({ frames, metadata }, { pretty: true }));
