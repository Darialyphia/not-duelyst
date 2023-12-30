import path from 'path';
import { createUnoConfig } from '@hc/unocss-config';

export default createUnoConfig({
  themePath: path.join(__dirname, '../ui/styles/theme.css'),
  additional: [`../../libs/ui`, `../../libs/game-client`]
});
