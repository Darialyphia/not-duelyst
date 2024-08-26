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
import type { CellConditionBase } from './conditions/cell-conditions';
import type { Cell } from '../board/cell';

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
  modifiers?: () => CardModifier[];
  relatedBlueprintIds?: CardBlueprintId[];
  shouldHighlightCell: (
    point: Point3D,
    options: {
      session: GameSession;
      playedPoint?: Point3D;
      targets: Point3D[];
      card: Card;
    }
  ) => boolean;
  getHighlightedCells(options: {
    session: GameSession;
    playedPoint?: Point3D;
    targets: Point3D[];
    card: Card;
  }): Cell[];
};

type CardBlueprintUnit = {
  kind: Extract<CardKind, 'MINION' | 'GENERAL'>;
  attack: number;
  maxHp: number;
  range: number;
  speed: number;
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
    getAllTargets(options: {
      session: GameSession;
      playedPoint?: Point3D;
      targets: Point3D[];
      card: Card;
    }): Cell[];
  };
  onPlay?: (options: {
    session: GameSession;
    card: Card;
    entity: Entity;
    targets: Array<Nullable<Point3D>>;
    choice: number;
  }) => Promise<void>;
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
    choice: number;
  }) => Promise<void>;
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
    getAllTargets(options: {
      session: GameSession;
      playedPoint?: Point3D;
      targets: Point3D[];
      card: Card;
    }): Cell[];
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
    choice: number;
  }) => Promise<void>;
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
    getAllTargets(options: {
      session: GameSession;
      playedPoint?: Point3D;
      targets: Point3D[];
      card: Card;
    }): Cell[];
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
  cellHighlights?: CellConditionBase[][];
};

type SerializedBlueprintUnit = {
  kind: Extract<CardKind, 'MINION' | 'GENERAL'>;
  attack: number;
  maxHp: number;
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

export type GenericSerializedBlueprint = SerializedBlueprint<any> & {
  type: Extract<CardKind, 'SPELL' | 'ARTIFACT'>;
  attack?: number;
  maxHp?: number;
  effects: GenericCardEffect[];
};

export const defineSerializedBlueprint = <T extends GenericCardEffect[]>(
  bp: SerializedBlueprint<T>
) => bp;
