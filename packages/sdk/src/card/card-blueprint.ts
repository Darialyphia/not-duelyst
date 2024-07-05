import type {
  MaybePromise,
  Nullable,
  PartialRecord,
  Point3D,
  Values
} from '@game/shared';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { CardModifier } from '../modifier/card-modifier';
import type { Card, CardBlueprintId } from './card';
import type { CardKind, Faction, Rarity } from './card-enums';
import type { Keyword } from '../utils/keywords';
import type { Tribe } from '../utils/tribes';

export const MULTICOLOR = 'multicolor' as const;

export type CardBlueprint = {
  id: CardBlueprintId;
  name: string;
  kind: CardKind;
  description: string;
  collectable: boolean;
  faction: Faction | null;
  spriteId: string;
  rarity: Rarity;
  cost: number;
  attack: number;
  maxHp: number;
  speed: number;
  range: number;
  tribes?: Tribe[];
  keywords?: Keyword[];
  modifiers?: CardModifier[];
  relatedBlueprintIds?: CardBlueprintId[];
  isWithinDangerZone?: (
    point: Point3D,
    ctx: { session: GameSession; entity: Entity }
  ) => boolean;
  onPlay?: (options: {
    session: GameSession;
    card: Card;
    entity: Entity;
    followup: Array<Nullable<Point3D>>;
  }) => MaybePromise<void>;
  followup?: {
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(
      point: Point3D,
      options: {
        session: GameSession;
        summonedPoint: Point3D;
        card: Card;
      }
    ): boolean;
  };
  blueprintFollowup?: {
    minChoices: number;
    maxChoices: number;
    getChoices(): CardBlueprint[];
  };
};
