import type { MaybePromise, Nullable, Point3D } from '@game/shared';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { CardModifier } from '../modifier/card-modifier';
import type { Card, CardBlueprintId } from './card';
import type { CardKind, Faction, Rarity } from './card-enums';
import type { Cell } from '../board/cell';
import type { Skill } from '../entity/skill';
import type { Keyword } from '../utils/keywords';

export type SkillId = string;

export type SkillBlueprint = {
  id: SkillId;
  name: string;
  iconId: string;
  description: string;
  minTargetCount: number;
  maxTargetCount: number;
  cooldown: number;
  initialCooldown: number;
  keywords?: Keyword[];
  isTargetable(
    point: Point3D,
    options: {
      skill: Skill;
      session: GameSession;
      castPoints: Point3D[];
    }
  ): boolean;
  isInAreaOfEffect(
    point: Point3D,
    options: {
      skill: Skill;
      session: GameSession;
      castPoints: Point3D[];
    }
  ): boolean;
  onUse(options: {
    session: GameSession;
    skill: Skill;
    castPoints: Point3D[];
    affectedCells: Cell[];
  }): MaybePromise<void>;
};

export type CardBlueprint = {
  id: CardBlueprintId;
  name: string;
  description: string;
  collectable: boolean;
  factions: [Nullable<Faction>, Nullable<Faction>, Nullable<Faction>];
  spriteId: string;
  rarity: Rarity;
  cost: number;
  cooldown: number;
  initialCooldown: number;
  attack: number;
  maxHp: number;
  speed: number;
  range: number;
  kind: CardKind;
  keywords?: Keyword[];
  modifiers?: CardModifier[];
  onPlay?: (options: {
    session: GameSession;
    card: Card;
    entity: Entity;
    followup: Point3D[];
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
  skills: SkillBlueprint[];
};
