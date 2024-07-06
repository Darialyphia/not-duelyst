import {
  isDefined,
  type AnyObject,
  type Defined,
  type Nullable,
  type Point3D
} from '@game/shared';
import { ENTITY_EVENTS, type Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { CardModifier } from '../modifier/card-modifier';
import type { Card, CardBlueprintId } from './card';
import {
  CARD_KINDS,
  FACTIONS,
  getFactionById,
  type CardKind,
  type Faction,
  type FactionId,
  type Rarity
} from './card-enums';
import { getKeywordById, type Keyword, type KeywordId } from '../utils/keywords';
import { getTagById, type Tag, type TagId } from '../utils/tribes';
import type { CardEffect } from './card-effect';
import { match } from 'ts-pattern';
import { getPlayers, getUnits, parseCardAction } from './actions/card-action';
import { dyingWish, openingGambit, whileOnBoard } from '../modifier/modifier-utils';
import { createEntityModifier } from '../modifier/entity-modifier';
import { modifierSelfEventMixin } from '../modifier/mixins/self-event.mixin';
import { PLAYER_EVENTS } from '../player/player';

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

export type SerializedBlueprintBase = {
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
  effects: CardEffect[];
  followup?: AnyObject;
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

export type SerializedBlueprint =
  | (SerializedBlueprintBase & SerializedBlueprintUnit)
  | (SerializedBlueprintBase & SerializedBlueprintSpell)
  | (SerializedBlueprintBase & SerializedBlueprintArtifact);

export type OnPlayCtx = Parameters<Defined<CardBlueprint['onPlay']>>[0] & {
  entity?: Entity;
};

const getPlayCtxEntity = (ctx: OnPlayCtx) => ctx.entity ?? ctx.card.player.general;

const parseSerializeBlueprintEffect = (
  effect: SerializedBlueprint['effects'][number]
): { onPlay?: (ctx: OnPlayCtx) => void } => {
  const actions = effect.config.actions.map(parseCardAction);

  return match(effect.config.trigger)
    .with({ type: 'on_before_card_played' }, trigger => {
      return {};
    })
    .with({ type: 'on_after_card_played' }, trigger => {
      return {};
    })
    .with({ type: 'on_before_player_draw' }, trigger => {
      return {};
    })
    .with({ type: 'on_after_player_draw' }, trigger => {
      return {};
    })
    .with({ type: 'on_before_player_replace' }, trigger => {
      return {};
    })
    .with({ type: 'on_after_player_replace' }, trigger => {
      return {};
    })
    .with({ type: 'on_before_unit_move' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.BEFORE_MOVE,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_after_unit_move' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.AFTER_MOVE,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_before_unit_attack' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.BEFORE_ATTACK,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_after_unit_attack' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.AFTER_ATTACK,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_before_unit_healed' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.BEFORE_HEAL,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_after_unit_healed' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.AFTER_HEAL,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_before_unit_take_damage' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.BEFORE_TAKE_DAMAGE,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_after_unit_take_damage' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.AFTER_TAKE_DAMAGE,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_before_unit_deal_damage' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.BEFORE_DEAL_DAMAGE,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_after_unit_deal_damage' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.AFTER_DEAL_DAMAGE,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_before_unit_retaliate' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.BEFORE_RETALIATE,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_after_unit_retaliate' }, trigger => {
      return {
        onPlay(ctx: OnPlayCtx) {
          getUnits({
            ...ctx,
            conditions: trigger.params.unit
          }).forEach(unit => {
            unit.addModifier(
              createEntityModifier({
                source: getPlayCtxEntity(ctx),
                stackable: false,
                visible: false,
                mixins: [
                  modifierSelfEventMixin({
                    eventName: ENTITY_EVENTS.AFTER_RETALIATE,
                    listener() {
                      actions.forEach(action => action(ctx));
                    }
                  })
                ]
              })
            );
          });
        }
      };
    })
    .with({ type: 'on_unit_play' }, () => {
      return {
        onplay(options: OnPlayCtx) {
          return openingGambit({
            source: getPlayCtxEntity(options),
            handler() {
              actions.forEach(action => action(options));
            }
          });
        }
      };
    })
    .with({ type: 'on_unit_death' }, () => {
      return {
        onplay(options: OnPlayCtx) {
          return dyingWish({
            source: getPlayCtxEntity(options),
            handler() {
              actions.forEach(action => action(options));
            }
          });
        }
      };
    })
    .with({ type: 'while_in_hand' }, trigger => {
      return {};
    })
    .with({ type: 'while_on_board' }, () => {
      return {
        onPlay: (options: OnPlayCtx) => {
          let cleanups: Array<() => void> = [];
          whileOnBoard({
            source: getPlayCtxEntity(options),
            onApplied() {
              cleanups = actions.map(action => action(options));
            },
            onRemoved() {
              cleanups.forEach(fn => fn());
            }
          });
        }
      };
    })
    .with({ type: 'on_card_drawn' }, trigger => {
      return {};
    })
    .with({ type: 'on_player_turn_start' }, trigger => {
      return {
        onPlay: (options: OnPlayCtx) => {
          const onTurnStart = () => {
            actions.forEach(action => action(options));
          };
          whileOnBoard({
            source: getPlayCtxEntity(options),
            onApplied() {
              getPlayers({ ...options, conditions: trigger.params.player }).forEach(
                player => {
                  player.on(PLAYER_EVENTS.TURN_START, onTurnStart);
                }
              );
            },
            onRemoved() {
              getPlayers({ ...options, conditions: trigger.params.player }).forEach(
                player => {
                  player.off(PLAYER_EVENTS.TURN_START, onTurnStart);
                }
              );
            }
          });
        }
      };
    })
    .with({ type: 'on_player_turn_end' }, trigger => {
      return {
        onPlay: (options: OnPlayCtx) => {
          const onTurnStart = () => {
            actions.forEach(action => action(options));
          };
          whileOnBoard({
            source: getPlayCtxEntity(options),
            onApplied() {
              getPlayers({ ...options, conditions: trigger.params.player }).forEach(
                player => {
                  player.on(PLAYER_EVENTS.TURN_END, onTurnStart);
                }
              );
            },
            onRemoved() {
              getPlayers({ ...options, conditions: trigger.params.player }).forEach(
                player => {
                  player.off(PLAYER_EVENTS.TURN_END, onTurnStart);
                }
              );
            }
          });
        }
      };
    })
    .with({ type: 'zeal' }, trigger => {
      return {};
    })
    .exhaustive();
};

export const parseSerializeBlueprint = (blueprint: SerializedBlueprint) => {
  const effects = blueprint.effects.map(parseSerializeBlueprintEffect);
  const base: Omit<CardBlueprint, 'kind'> = {
    id: blueprint.id,
    name: blueprint.name,
    description: '',
    collectable: blueprint.collectable,
    rarity: blueprint.rarity,
    faction: blueprint.faction ? getFactionById(blueprint.faction) ?? null : null,
    spriteId: blueprint.spriteId,
    cost: blueprint.cost,
    relatedBlueprintIds: blueprint.relatedBlueprintIds,
    keywords: blueprint.keywords.map(getKeywordById).filter(isDefined),
    tags: blueprint.tags.map(getTagById).filter(isDefined),
    onPlay(options: OnPlayCtx) {
      effects.forEach(effect => {
        effect.onPlay?.(options);
      });
    }
  };

  return match(blueprint)
    .with({ kind: CARD_KINDS.GENERAL }, { kind: CARD_KINDS.MINION }, blueprint => {
      const parsed = {
        ...base,
        kind: blueprint.kind,
        attack: blueprint.attack,
        maxHp: blueprint.maxHp,
        speed: blueprint.speed,
        range: 1
      };

      return parsed as CardBlueprint;
    })
    .with({ kind: CARD_KINDS.SPELL }, blueprint => {
      const parsed = {
        ...base,
        kind: blueprint.kind,
        attack: undefined,
        maxHp: undefined,
        speed: undefined,
        range: undefined
      };

      return parsed as CardBlueprint;
    })
    .with({ kind: CARD_KINDS.ARTIFACT }, blueprint => {
      const parsed = {
        ...base,
        kind: blueprint.kind
      };

      return parsed as CardBlueprint;
    })
    .exhaustive();
};
