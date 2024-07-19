import { defaultConfig } from '@game/sdk';
import type { GameFormat } from './format.entity';

export const defaultFormat = {
  config: defaultConfig
} satisfies GameFormat;
