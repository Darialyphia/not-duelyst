import type { CardBlueprint } from './card-blueprint';
import type { CellCondition, Filter } from './card-effect';

export type CardFollowupConfig = {
  min: number;
  targets: Array<Filter<CellCondition>>;
};

export const parseFollwup = (
  config: CardFollowupConfig
): Exclude<CardBlueprint['followup'], undefined> => {
  return {
    minTargetCount: config.min,
    maxTargetCount: config.targets.length,
    isTargetable(point, { card, session, playedPoint, followups }) {
      return true;
    }
  };
};
