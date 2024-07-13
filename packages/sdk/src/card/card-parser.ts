import { isDefined, type Defined } from '@game/shared';
import { type Entity } from '../entity/entity';
import type { GameEvent, GameEventMap } from '../game-session';
import { createCardModifier, type CardModifier } from '../modifier/card-modifier';
import { CARD_KINDS, getFactionById } from './card-enums';
import { getKeywordById } from '../utils/keywords';
import { getTagById } from '../utils/tribes';
import { match } from 'ts-pattern';
import {
  getCards,
  getPlayers,
  getUnits,
  parseCardAction,
  parseCardInitAction,
  type ParsedActionResult
} from './card-action';
import { whileInDeck, whileInHand, whileOnBoard } from '../modifier/modifier-utils';
import { createEntityModifier, type EntityModifier } from '../modifier/entity-modifier';
import {
  modifierCardGameEventMixin,
  modifierGameEventMixin
} from '../modifier/mixins/game-event.mixin';
import type { CardBlueprint, SerializedBlueprint } from './card-blueprint';
import type { GenericCardEffect, Trigger } from './card-effect';
import { parseTargets } from './card-targets';

export type EffectCtx = Parameters<Defined<CardBlueprint['onPlay']>>[0] & {
  entity?: Entity;
};

const getEffectCtxEntity = (ctx: EffectCtx) => ctx.entity ?? ctx.card.player.general;
const getEffectModifier = <T extends GameEvent>({
  filter,
  eventName,
  actions
}: {
  eventName: T;
  filter: (ctx: EffectCtx, event: GameEventMap[T], eventName: T) => boolean;
  actions: ParsedActionResult[];
}) => {
  return {
    getEntityModifier: (ctx: EffectCtx) =>
      createEntityModifier({
        source: getEffectCtxEntity(ctx),
        stackable: false,
        visible: false,
        mixins: [
          modifierGameEventMixin({
            eventName,
            listener(event) {
              if (filter(ctx, event, eventName))
                actions.forEach(action => action(ctx, event, eventName));
            }
          })
        ]
      }),
    getCardModifier: () => {
      return createCardModifier({
        stackable: false,
        mixins: [
          modifierCardGameEventMixin({
            eventName,
            listener(event, ctx) {
              const effectCtx = {
                session: ctx.session,
                card: ctx.attachedTo,
                targets: []
              };
              if (filter(effectCtx, event, eventName))
                actions.forEach(action => action(effectCtx, event, eventName));
            }
          })
        ]
      });
    }
  };
};

const parseSerializeBlueprintEffect = (
  effect: SerializedBlueprint<GenericCardEffect[]>['effects'][number]
): Array<{
  onInit?: (blueprint: CardBlueprint) => void;
  onPlay?: (ctx: EffectCtx) => void;
  getCardModifier?: () => CardModifier;
  getEntityModifier?: (ctx: EffectCtx) => EntityModifier;
}> => {
  return match(effect.config)
    .with({ executionContext: 'immediate' }, config => [
      {
        onPlay(ctx: EffectCtx) {
          const actions = config.actions.map(parseCardAction);
          actions.forEach(action => {
            action(ctx, {});
          });
        }
      }
    ])
    .with({ executionContext: 'on_init' }, config => {
      return [
        {
          onInit(blueprint: CardBlueprint) {
            const actions = config.actions.map(parseCardInitAction);

            actions.forEach(action => {
              action({ blueprint });
            });
          }
        }
      ];
    })
    .with(
      { executionContext: 'while_in_deck' },
      { executionContext: 'while_in_graveyard' },
      { executionContext: 'while_in_hand' },
      { executionContext: 'while_on_board' },
      config => {
        const actions = config.actions.map(parseCardAction);

        return config.triggers.map((trigger: Trigger) =>
          match(trigger)
            .with({ type: 'on_before_card_played' }, trigger => {
              return getEffectModifier({
                eventName: 'card:before_played',
                actions,
                filter(ctx, [event], eventName) {
                  return getCards({
                    ...ctx,
                    conditions: trigger.params.card,
                    event,
                    eventName
                  }).some(card => event === card);
                }
              });
            })
            .with({ type: 'on_after_card_played' }, trigger => {
              return getEffectModifier({
                eventName: 'card:after_played',
                actions,
                filter(ctx, [event], eventName) {
                  return getCards({
                    ...ctx,
                    conditions: trigger.params.card,
                    event,
                    eventName
                  }).some(card => event === card);
                }
              });
            })
            .with({ type: 'on_before_player_draw' }, trigger => {
              return getEffectModifier({
                eventName: 'player:before_draw',
                actions,
                filter(ctx, [event]) {
                  return getPlayers({
                    ...ctx,
                    conditions: trigger.params.player
                  }).some(player => player.equals(event.player));
                }
              });
            })
            .with({ type: 'on_after_player_draw' }, trigger => {
              return getEffectModifier({
                eventName: 'player:after_draw',
                actions,
                filter(ctx, [event]) {
                  return getPlayers({
                    ...ctx,
                    conditions: trigger.params.player
                  }).some(player => player.equals(event.player));
                }
              });
            })
            .with({ type: 'on_before_player_replace' }, trigger => {
              return getEffectModifier({
                eventName: 'player:before_replace',
                actions,
                filter(ctx, [event]) {
                  return getPlayers({
                    ...ctx,
                    conditions: trigger.params.player
                  }).some(player => player.equals(event.player));
                }
              });
            })
            .with({ type: 'on_after_player_replace' }, trigger => {
              return getEffectModifier({
                eventName: 'player:after_replace',
                actions,
                filter(ctx, [event]) {
                  return getPlayers({
                    ...ctx,
                    conditions: trigger.params.player
                  }).some(player => player.equals(event.player));
                }
              });
            })
            .with({ type: 'on_before_unit_move' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:before-move',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_after_unit_move' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:before-move',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_before_unit_attack' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:before_attack',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_after_unit_attack' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:after_attack',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_before_unit_healed' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:before_heal',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_after_unit_healed' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:after_heal',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_before_unit_take_damage' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:before_take_damage',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_after_unit_take_damage' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:after_take_damage',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_before_unit_deal_damage' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:before_deal_damage',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_after_unit_deal_damage' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:after_deal_damage',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_before_unit_retaliate' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:before_retaliate',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_after_unit_retaliate' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:after_retaliate',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event.entity));
                }
              });
            })
            .with({ type: 'on_unit_play' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:created',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event));
                }
              });
            })
            .with({ type: 'on_before_unit_destroyed' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:before_destroy',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event));
                }
              });
            })
            .with({ type: 'on_after_unit_destroyed' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'entity:after_destroy',
                filter(ctx, [event], eventName) {
                  return getUnits({
                    ...ctx,
                    conditions: trigger.params.unit,
                    event,
                    eventName
                  }).some(entity => entity.equals(event));
                }
              });
            })
            .with({ type: 'on_card_drawn' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'card:drawn',
                filter(ctx, [event], eventName) {
                  return getCards({
                    ...ctx,
                    conditions: trigger.params.card,
                    event,
                    eventName
                  }).some(card => card === event);
                }
              });
            })
            .with({ type: 'on_card_replaced' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'card:replaced',
                filter(ctx, [event], eventName) {
                  return getCards({
                    ...ctx,
                    conditions: trigger.params.card,
                    event,
                    eventName
                  }).some(card => card === event);
                }
              });
            })
            .with({ type: 'on_player_turn_start' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'player:turn_start',
                filter(ctx, [event]) {
                  return getPlayers({
                    ...ctx,
                    conditions: trigger.params.player
                  }).some(player => player.equals(event));
                }
              });
            })
            .with({ type: 'on_player_turn_end' }, trigger => {
              return getEffectModifier({
                actions,
                eventName: 'player:turn_end',
                filter(ctx, [event]) {
                  return getPlayers({
                    ...ctx,
                    conditions: trigger.params.player
                  }).some(player => player.equals(event));
                }
              });
            })
            .exhaustive()
        );
      }
    )
    .exhaustive();
};

export const parseSerializeBlueprint = <T extends GenericCardEffect[]>(
  blueprint: SerializedBlueprint<T>
) => {
  // first, parse the blueprint effects
  const effects = blueprint.effects.map(effect => ({
    ...effect,
    actions: parseSerializeBlueprintEffect(effect)
  }));

  // add card modifiers that have already been evaluated
  const cardModifiers = effects
    .map(effect => {
      return match(effect.config.executionContext)
        .with('on_init', () => {
          return effect.actions
            .map(action => {
              if (!action.getCardModifier) return null;
              return action.getCardModifier();
            })
            .flat()
            .filter(isDefined);
        })
        .with('while_in_hand', () => {
          return effect.actions
            .map(action => {
              if (!action.getCardModifier) return null;
              const modifier = action.getCardModifier();
              return createCardModifier({
                stackable: false,
                mixins: [
                  {
                    onApplied(session, card) {
                      whileInHand(
                        card,
                        () => {
                          card.addModifier(modifier);
                        },
                        () => {
                          card.removeModifier(modifier.id);
                        }
                      );
                    }
                  }
                ]
              });
            })
            .flat()
            .filter(isDefined);
        })
        .with('while_in_deck', () => {
          return effect.actions
            .map(action => {
              if (!action.getCardModifier) return null;
              const modifier = action.getCardModifier();
              return createCardModifier({
                stackable: false,
                mixins: [
                  {
                    onApplied(session, card) {
                      whileInDeck(
                        card,
                        () => {
                          card.addModifier(modifier);
                        },
                        () => {
                          card.removeModifier(modifier.id);
                        }
                      );
                    }
                  }
                ]
              });
            })
            .flat()
            .filter(isDefined);
        })
        .with('while_in_graveyard', () => {
          // TODO graveyard management not ready yet
          return null;
        })
        .otherwise(() => null);
    })
    .flat()
    .filter(isDefined);

  // define the base blueprint data
  const base: Omit<CardBlueprint, 'kind'> = {
    id: blueprint.id,
    name: blueprint.name,
    description: blueprint.effects.map(effect => effect.text).join('\n'),
    collectable: blueprint.collectable,
    rarity: blueprint.rarity,
    faction: blueprint.faction ? (getFactionById(blueprint.faction) ?? null) : null,
    spriteId: blueprint.spriteId,
    cost: blueprint.cost,
    relatedBlueprintIds: blueprint.relatedBlueprintIds,
    keywords: blueprint.keywords.map(getKeywordById).filter(isDefined),
    tags: blueprint.tags.map(getTagById).filter(isDefined),
    modifiers: cardModifiers,
    targets: blueprint.targets ? parseTargets(blueprint.targets) : undefined,
    onPlay(ctx: EffectCtx) {
      effects.forEach(effect => {
        match(effect.config.executionContext)
          .with('while_on_board', () => {
            effect.actions.forEach(action => {
              if (!action.getEntityModifier) return;
              const entityModifier = action.getEntityModifier(ctx);
              whileOnBoard({
                entity: getEffectCtxEntity(ctx),
                source: getEffectCtxEntity(ctx),
                onApplied(session, attachedTo) {
                  attachedTo.addModifier(entityModifier);
                },
                onRemoved(session, attachedTo) {
                  attachedTo.removeModifier(entityModifier.id);
                }
              });
            });
          })
          .with('immediate', () => {
            effect.actions.forEach(action => {
              action.onPlay?.(ctx);
            });
          })
          .otherwise(() => {
            return;
          });
      });
    }
  };

  // add blueprint kind specific informations
  const withStats = match(blueprint)
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
        kind: blueprint.kind
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

  // finally, run the on init effects now that the blueprint has been fully constructed
  effects.forEach(effect => {
    effect.actions.forEach(action => {
      if (action.onInit) {
        action.onInit(withStats);
      }
    });
  });

  return withStats;
};
