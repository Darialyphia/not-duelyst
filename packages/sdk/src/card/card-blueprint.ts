import type { MaybePromise, Nullable, Point3D } from '@game/shared';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { CardModifier } from '../modifier/card-modifier';
import type { Card, CardBlueprintId } from './card';
import type { CardKind, Faction, Rarity } from './card-enums';
import type { Cell } from '../board/cell';
import type { Skill } from '../entity/skill';
import type { Keyword } from '../utils/keywords';
import type { Tribe } from '../utils/tribes';

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
  canUse?: (options: { session: GameSession; skill: Skill }) => boolean;
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
      castPoints: Array<Nullable<Point3D>>;
    }
  ): boolean;
  onUse(options: {
    session: GameSession;
    skill: Skill;
    castPoints: Point3D[];
    affectedCells: Cell[];
    blueprintFollowup: CardBlueprint[];
  }): MaybePromise<void>;
  blueprintFollowup?: {
    minChoices: number;
    maxChoices: number;
    getChoices(): CardBlueprint[];
  };
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
  skills: SkillBlueprint[];
};
