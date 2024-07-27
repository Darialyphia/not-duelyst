export { GameSession, type SerializedGameState } from './game-session';
export { Cell } from './board/cell';
export { Entity, type EntityId } from './entity/entity';
export { Player, type PlayerId } from './player/player';
export { BoardSystem as GameMap } from './board/board-system';
export { defaultConfig, type GameSessionConfig, VERSION } from './config';
export { KEYWORDS, type Keyword, type KeywordId } from './utils/keywords';
export {
  type EntityModifier as Modifier,
  type ModifierId
} from './modifier/entity-modifier';
export { Card } from './card/card';
export {
  CARD_KINDS,
  FACTIONS,
  FACTION_IDS,
  RARITIES,
  type CardKind,
  type Faction,
  type Rarity
} from './card/card-enums';
export { type Animation } from './fx-system';
export { CARDS } from './card/card-lookup';
export {
  type CardBlueprint,
  type SerializedBlueprint,
  type GenericSerializedBlueprint
} from './card/card-blueprint';
export type {
  WidenedGenericCardEffect,
  InitAction,
  Trigger,
  Filter,
  ExecutionContext,
  Action,
  Amount,
  NumericOperator,
  CardEffectConfig,
  TriggerFrequency
} from './card/card-effect';
export type { CardTargetsConfig } from './card/card-targets';
export type {
  UnitConditionBase,
  UnitConditionExtras,
  UnitCondition
} from './card/conditions/unit-conditions';
export type {
  PlayerConditionBase,
  PlayerConditionExtras,
  PlayerCondition
} from './card/conditions/player-condition';
export type {
  CardCondition,
  CardConditionBase,
  CardConditionExtras
} from './card/conditions/card-conditions';
export type {
  CellConditionBase,
  CellCondition,
  CellConditionExtras
} from './card/conditions/cell-conditions';

export type { GlobalCondition } from './card/conditions/global-conditions';
export type { GameAction } from './action/action';
export { TutorialSession, type TutorialStep } from './tutorial-session';
export { TERRAINS, type Terrain } from './board/board-utils';
export { ClientSession } from './client-session';
export { ServerSession } from './server-session';
export { type Tag } from './utils/tribes';
export type { Unit } from './card/unit';
export type { Spell } from './card/spell';
export type { Artifact } from './card/artifact';
