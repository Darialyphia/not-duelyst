export { GameSession, type SerializedGameState } from './game-session';
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
export { type Animation, type FXEventMap, FXSystem } from './fx-system';
export { CARDS } from './card/card-lookup';
export {
  type CardBlueprint,
  type SerializedBlueprint,
  type GenericSerializedBlueprint
} from './card/card-blueprint';
export type {
  WidenedGenericCardEffect,
  InitAction,
  Filter,
  ExecutionContext,
  Action,
  NumericOperator,
  CardEffectConfig
} from './card/card-effect';
export type { Amount } from './card/helpers/amount';
export type { Trigger, TriggerFrequency } from './card/card-action-triggers';
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
export { ServerSession, type SimulationResult } from './server-session';
export { type Tag, TAGS } from './utils/tribes';
export type { Unit } from './card/unit';
export type { Spell } from './card/spell';
export type { Artifact } from './card/artifact';
export type { Cell, CellId } from './board/cell';
export type { GameEvent, GameEventPayload } from './game-session';
