import type { Nullable, Point3D } from '@game/shared';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { CardModifier } from '../modifier/card-modifier';
import type { Card, CardBlueprintId } from './card';
import type { CardKind, Faction, Rarity } from './card-enums';
import type { Keyword } from '../utils/keywords';
import type { Tag } from '../utils/tribes';

export const MULTICOLOR = 'multicolor' as const;

export type CardBlueprintBase = {
  id: CardBlueprintId;
  name: string;
  description: string;
  collectable: boolean;
  faction: Faction | null;
  spriteId: string;
  rarity: Rarity;
  cost: number;
  tags?: Tag[];
  keywords?: Keyword[];
  modifiers?: CardModifier[];
  relatedBlueprintIds?: CardBlueprintId[];
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

type CardBlueprintUnit = {
  kind: Extract<CardKind, 'MINION' | 'GENERAL'>;
  attack: number;
  maxHp: number;
  speed: number;
  range: number;
  onPlay?: (options: {
    session: GameSession;
    card: Card;
    entity: Entity;
    followup: Array<Nullable<Point3D>>;
  }) => void;
};

type CardBlueprintSpell = {
  kind: Extract<CardKind, 'SPELL'>;
  attack?: never;
  maxHp?: never;
  speed?: never;
  range?: never;
  onPlay?: (options: {
    session: GameSession;
    card: Card;
    followup: Array<Nullable<Point3D>>;
  }) => void;
};

type CardBlueprintArtifact = {
  kind: Extract<CardKind, 'ARTIFACT'>;
  attack?: never;
  maxHp?: never;
  speed?: never;
  range?: never;
  onPlay?: (options: {
    session: GameSession;
    card: Card;
    followup: Array<Nullable<Point3D>>;
  }) => void;
};

export type CardBlueprint =
  | (CardBlueprintBase & CardBlueprintUnit)
  | (CardBlueprintBase & CardBlueprintSpell)
  | (CardBlueprintBase & CardBlueprintArtifact);
