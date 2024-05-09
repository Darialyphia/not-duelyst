import type { Doc } from '../_generated/dataModel';

export type Game = Omit<Doc<'games'>, 'id'>;
