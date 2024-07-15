import { type Nullable, type Point3D } from '@game/shared';
import { type Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import { type CardModifier } from '../modifier/card-modifier';
import type { Card, CardBlueprintId } from './card';
import { type CardKind, type Faction, type FactionId, type Rarity } from './card-enums';
import { type Keyword, type KeywordId } from '../utils/keywords';
import { type Tag, type TagId } from '../utils/tribes';
import type { GenericCardEffect } from './card-effect';
import type { CardTargetsConfig } from './card-targets';
import type { PlayerArtifact } from '../player/player-artifact';

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
  cardChoices?: {
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
  targets?: {
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(
      point: Point3D,
      options: {
        session: GameSession;
        playedPoint?: Point3D;
        targets: Point3D[];
        card: Card;
      }
    ): boolean;
  };
  onPlay?: (options: {
    session: GameSession;
    card: Card;
    entity: Entity;
    targets: Array<Nullable<Point3D>>;
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
    targets: Array<Nullable<Point3D>>;
  }) => void;
  targets?: {
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(
      point: Point3D,
      options: {
        session: GameSession;
        targets: Point3D[];
        card: Card;
      }
    ): boolean;
  };
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
    artifact: PlayerArtifact;
    targets: Array<Nullable<Point3D>>;
  }) => void;
  targets?: {
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(
      point: Point3D,
      options: {
        session: GameSession;
        targets: Point3D[];
        card: Card;
      }
    ): boolean;
  };
};

export type CardBlueprint =
  | (CardBlueprintBase & CardBlueprintUnit)
  | (CardBlueprintBase & CardBlueprintSpell)
  | (CardBlueprintBase & CardBlueprintArtifact);

export type SerializedBlueprintBase<T extends GenericCardEffect[]> = {
  id: string;
  name: string;
  collectable: boolean;
  faction: FactionId | null;
  spriteId: string;
  rarity: Rarity;
  cost: number;
  tags: TagId[];
  keywords: KeywordId[];
  relatedBlueprintIds: string[];
  effects: T;
  targets?: CardTargetsConfig;
};

type SerializedBlueprintUnit = {
  kind: Extract<CardKind, 'MINION' | 'GENERAL'>;
  attack: number;
  maxHp: number;
  speed: number;
};

type SerializedBlueprintSpell = {
  kind: Extract<CardKind, 'SPELL'>;
};

type SerializedBlueprintArtifact = {
  kind: Extract<CardKind, 'ARTIFACT'>;
};

export type SerializedBlueprint<T extends GenericCardEffect[]> =
  | (SerializedBlueprintBase<T> & SerializedBlueprintUnit)
  | (SerializedBlueprintBase<T> & SerializedBlueprintSpell)
  | (SerializedBlueprintBase<T> & SerializedBlueprintArtifact);

export const defineSerializedBlueprint = <T extends GenericCardEffect[]>(
  bp: SerializedBlueprint<T>
) => bp;
