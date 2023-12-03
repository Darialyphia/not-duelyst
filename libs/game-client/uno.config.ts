// uno.config.ts
import {
  defineConfig,
  presetUno,
  transformerVariantGroup,
  presetIcons,
  type Preset
} from 'unocss';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import * as csstree from 'css-tree';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const cssTheme = fs.readFileSync(path.join(__dirname, 'styles/theme.css'), {
  encoding: 'utf-8'
});

const ast = csstree.parse(cssTheme);
const themeColors: Record<string, string> = {};
const colorIdentifierRE = new RegExp('--color-(.+)-hsl$');

csstree.walk(ast, node => {
  if (node.type !== 'Declaration') return;
  const { property } = node;
  const match = property.match(colorIdentifierRE);
  if (match?.[1]) {
    themeColors[match[1]] = `hsl(var(${property}) / <alpha-value>)`;
  }
});
export default defineConfig({
  blocklist: ['container'],
  presets: [presetIcons(), presetUno()],
  transformers: [transformerVariantGroup()],
  content: {
    filesystem: ['**/*.{html,js,ts,vue}', `../../libs/game-client/**/*.{html,js,ts,vue}`]
  },
  theme: {
    colors: themeColors
  }
});
