import { isDefined, isObject, Vec3, type Defined, type Point3D } from '@game/shared';
import { type Entity } from '../entity/entity';
import type { GameEvent, GameEventMap, GameFormat, GameSession } from '../game-session';
import { createCardModifier, type CardModifier } from '../modifier/card-modifier';
import { CARD_KINDS, getFactionById } from './card-enums';
import { getKeywordById } from '../utils/keywords';
import { getTagById } from '../utils/tribes';
import { match } from 'ts-pattern';
import {
  parseCardAction,
  parseCardInitAction,
  type ParsedActionResult
} from './card-action';
import {
  whileEquipped,
  whileInDeck,
  whileInHand,
  whileOnBoard
} from '../modifier/modifier-utils';
import { createEntityModifier, type EntityModifier } from '../modifier/entity-modifier';
import {
  modifierCardGameEventMixin,
  modifierGameEventMixin
} from '../modifier/mixins/game-event.mixin';
import type { CardBlueprint, SerializedBlueprint } from './card-blueprint';
import type { Action, GenericCardEffect } from './card-effect';
import { parseTargets } from './card-targets';
import type { PlayerArtifact } from '../player/player-artifact';
import { getCards } from './conditions/card-conditions';
import { getPlayers } from './conditions/player-condition';
import { getUnits } from './conditions/unit-conditions';
import { defaultConfig } from '../config';
import { CARDS } from './card-lookup';
import type { Card } from './card';
import { getCells } from './conditions/cell-conditions';
import { Unit } from './unit';
import type { TriggerFrequency, Trigger } from './card-action-triggers';

export type EffectCtx = Parameters<Defined<CardBlueprint['onPlay']>>[0] & {
  entity?: Entity;
  artifact?: PlayerArtifact;
  playedPoint?: Point3D;
};

const getEffectCtxEntity = (ctx: EffectCtx) => ctx.entity ?? ctx.card.player.general;
export const getEffectModifier = <T extends GameEvent>({
  filter,
  frequency,
  eventName,
  actions
}: {
  eventName: T;
  filter: (ctx: EffectCtx, event: GameEventMap[T], eventName: T) => boolean;
  actions: ParsedActionResult[];
  frequency: TriggerFrequency;
}) => {
  return {
    getEntityModifier: (ctx: EffectCtx) => {
      let n = 0;
      const resetCount = () => {
        n = 0;
      };
      ctx.session.on('player:turn_start', resetCount);
      const cleanups: Array<() => void> = [
        () => ctx.session.off('player:turn_start', resetCount)
      ];

      return createEntityModifier({
        source: ctx.card,
        stackable: false,
        visible: false,
        mixins: [
          modifierGameEventMixin({
            eventName,
            once: frequency.type === 'once',
            async listener(event) {
              if (!filter(ctx, event, eventName)) return;
              if (frequency.type === 'n_per_turn' && frequency.params.count < n) return;

              for (const action of actions) {
                const [eventPayload] = event;
                const cleanup = await action(
                  ctx,
                  isObject(eventPayload) ? eventPayload : {},
                  eventName
                );
                n++;
                cleanups.push(cleanup);
              }
            }
          }),
          {
            onRemoved() {
              cleanups.forEach(cleanup => cleanup());
            }
          }
        ]
      });
    },
    getCardModifier: () => {
      const cleanups: Array<() => void> = [];

      return createCardModifier({
        stackable: false,
        mixins: [
          modifierCardGameEventMixin({
            eventName,
            once: frequency.type === 'once',
            async listener(event, ctx) {
              const effectCtx = {
                session: ctx.session,
                card: ctx.attachedTo,
                targets: []
              };
              if (filter(effectCtx, event, eventName)) {
                for (const action of actions) {
                  const [eventPayload] = event;

                  const cleanup = await action(
                    effectCtx,
                    isObject(eventPayload) ? eventPayload : {},
                    eventName
                  );
                  cleanups.push(cleanup);
                }
              }
            }
          }),
          {
            onRemoved() {
              cleanups.forEach(cleanup => cleanup());
            }
          }
        ]
      });
    }
  };
};

export const parseSerializedBlueprintEffect = (
  effect: SerializedBlueprint<GenericCardEffect[]>['effects'][number]
): Array<{
  onInit?: (blueprint: CardBlueprint) => void;
  onPlay?: (ctx: EffectCtx) => Promise<() => void>;
  getCardModifier?: () => CardModifier;
  getEntityModifier?: (ctx: EffectCtx) => EntityModifier;
}> => {
  return match(effect.config)
    .with({ executionContext: 'immediate' }, config => [
      {
        async onPlay(ctx: EffectCtx) {
          const actions = config.actions.map(parseCardAction);
          const cleanups: Array<() => void> = [];
          for (const action of actions) {
            cleanups.push(await action(ctx, {}));
          }
          return () => cleanups.forEach(c => c());
        }
      }
    ])
    .with({ executionContext: 'while_on_board' }, config => [
      {
        async onPlay(ctx: EffectCtx) {
          const cleanups: Array<() => void> = [];
          const entity = getEffectCtxEntity(ctx);
          whileOnBoard({
            source: ctx.card,
            entity,
            async onApplied() {
              const actions = config.actions.map(parseCardAction);

              for (const action of actions) {
                cleanups.push(await action(ctx, {}));
              }
            },
            onRemoved() {
              cleanups.forEach(c => c());
            }
          });

          return () => {
            return;
          };
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
      { executionContext: 'trigger_while_in_hand' },
      { executionContext: 'while_equiped' },
      { executionContext: 'trigger_while_on_board' },
      config => {
        const actions = (config.actions as Action[]).map(parseCardAction);
        return config.triggers.map((trigger: Trigger) =>
          match(trigger)
            .with({ type: 'on_before_card_played' }, trigger => {
              return getEffectModifier({
                eventName: 'card:before_played',
                actions,
                frequency: trigger.params.frequency,
                filter(ctx, [event], eventName) {
                  return trigger.params.card.length
                    ? getCards({
                        ...ctx,
                        conditions: trigger.params.card,
                        event,
                        eventName
                      }).some(card => event === card)
                    : true;
                }
              });
            })
            .with({ type: 'on_after_card_played' }, trigger => {
              return getEffectModifier({
                eventName: 'card:after_played',
                actions,
                frequency: trigger.params.frequency,
                filter(ctx, [event], eventName) {
                  event.blueprintId;
                  return trigger.params.card.length
                    ? getCards({
                        ...ctx,
                        conditions: trigger.params.card,
                        event,
                        eventName
                      }).some(card => event === card)
                    : true;
                }
              });
            })
            .with({ type: 'on_before_player_draw' }, trigger => {
              return getEffectModifier({
                eventName: 'player:before_draw',
                actions,
                frequency: trigger.params.frequency,
                filter(ctx, [event], eventName) {
                  return trigger.params.player.length
                    ? getPlayers({
                        ...ctx,
                        event,
                        eventName,
                        conditions: trigger.params.player
                      }).some(player => player.equals(event.player))
                    : true;
                }
              });
            })
            .with({ type: 'on_after_player_draw' }, trigger => {
              return getEffectModifier({
                eventName: 'player:after_draw',
                actions,
                frequency: trigger.params.frequency,
                filter(ctx, [event], eventName) {
                  return trigger.params.player.length
                    ? getPlayers({
                        ...ctx,
                        event,
                        eventName,
                        conditions: trigger.params.player
                      }).some(player => player.equals(event.player))
                    : true;
                }
              });
            })
            .with({ type: 'on_before_player_replace' }, trigger => {
              return getEffectModifier({
                eventName: 'player:before_replace',
                actions,
                frequency: trigger.params.frequency,
                filter(ctx, [event], eventName) {
                  return trigger.params.player.length
                    ? getPlayers({
                        ...ctx,
                        event,
                        eventName,
                        conditions: trigger.params.player
                      }).some(player => player.equals(event.player))
                    : true;
                }
              });
            })
            .with({ type: 'on_after_player_replace' }, trigger => {
              return getEffectModifier({
                eventName: 'player:after_replace',
                actions,
                frequency: trigger.params.frequency,
                filter(ctx, [event], eventName) {
                  return trigger.params.player.length
                    ? getPlayers({
                        ...ctx,
                        event,
                        eventName,
                        conditions: trigger.params.player
                      }).some(player => player.equals(event.player))
                    : true;
                }
              });
            })
            .with({ type: 'on_before_unit_move' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:before_move',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event.entity))
                    : true;
                }
              });
            })
            .with({ type: 'on_after_unit_move' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:after_move',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event.entity))
                    : true;
                }
              });
            })
            .with({ type: 'on_before_unit_teleport' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:before_teleport',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event.entity))
                    : true;
                }
              });
            })
            .with({ type: 'on_after_unit_teleport' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:after_teleport',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event.entity))
                    : true;
                }
              });
            })
            .with({ type: 'on_before_unit_attack' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:before_attack',
                filter(ctx, [event], eventName) {
                  return (
                    (trigger.params.unit.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.unit,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.entity))
                      : true) &&
                    (trigger.params.target.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.target,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.target))
                      : true)
                  );
                }
              });
            })
            .with({ type: 'on_after_unit_attack' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:after_attack',
                filter(ctx, [event], eventName) {
                  return (
                    (trigger.params.unit.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.unit,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.entity))
                      : true) &&
                    (trigger.params.target.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.target,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.target))
                      : true)
                  );
                }
              });
            })
            .with({ type: 'on_before_unit_healed' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:before_heal',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event.entity))
                    : true;
                }
              });
            })
            .with({ type: 'on_after_unit_healed' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:after_heal',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event.entity))
                    : true;
                }
              });
            })
            .with({ type: 'on_before_unit_take_damage' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:before_take_damage',
                filter(ctx, [event], eventName) {
                  return (
                    (trigger.params.unit.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.unit,
                          event,
                          eventName
                        }).some(entity => {
                          if (!(event.source instanceof Unit)) return false;
                          event.source.entity.equals(entity);
                        })
                      : true) &&
                    (trigger.params.target.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.target,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.entity))
                      : true)
                  );
                }
              });
            })
            .with({ type: 'on_after_unit_take_damage' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:after_take_damage',
                filter(ctx, [event], eventName) {
                  return (
                    (trigger.params.unit.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.unit,
                          event,
                          eventName
                        }).some(entity => {
                          if (!(event.source instanceof Unit)) return false;
                          event.source.entity.equals(entity);
                        })
                      : true) &&
                    (trigger.params.target.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.target,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.entity))
                      : true)
                  );
                }
              });
            })
            .with({ type: 'on_before_unit_deal_damage' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:before_deal_damage',
                filter(ctx, [event], eventName) {
                  return (
                    (trigger.params.unit.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.unit,
                          event,
                          eventName
                        }).some(entity => event.entity.equals(entity))
                      : true) &&
                    (trigger.params.target.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.target,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.target))
                      : true)
                  );
                }
              });
            })
            .with({ type: 'on_after_unit_deal_damage' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:after_deal_damage',
                filter(ctx, [event], eventName) {
                  return (
                    (trigger.params.unit.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.unit,
                          event,
                          eventName
                        }).some(entity => event.entity.equals(entity))
                      : true) &&
                    (trigger.params.target.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.target,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.target))
                      : true)
                  );
                }
              });
            })
            .with({ type: 'on_before_unit_retaliate' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:before_retaliate',
                filter(ctx, [event], eventName) {
                  return (
                    (trigger.params.unit.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.unit,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.entity))
                      : true) &&
                    (trigger.params.target.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.target,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.target))
                      : true)
                  );
                }
              });
            })
            .with({ type: 'on_after_unit_retaliate' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:after_retaliate',
                filter(ctx, [event], eventName) {
                  return (
                    (trigger.params.unit.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.unit,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.entity))
                      : true) &&
                    (trigger.params.target.length
                      ? getUnits({
                          ...ctx,
                          conditions: trigger.params.target,
                          event,
                          eventName
                        }).some(entity => entity.equals(event.target))
                      : true)
                  );
                }
              });
            })
            .with({ type: 'on_unit_play' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:created',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event))
                    : true;
                }
              });
            })
            .with({ type: 'on_before_unit_destroyed' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:before_destroy',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event))
                    : true;
                }
              });
            })
            .with({ type: 'on_after_unit_destroyed' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'entity:after_destroy',
                filter(ctx, [event], eventName) {
                  return trigger.params.unit.length
                    ? getUnits({
                        ...ctx,
                        conditions: trigger.params.unit,
                        event,
                        eventName
                      }).some(entity => entity.equals(event))
                    : true;
                }
              });
            })
            .with({ type: 'on_card_drawn' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'card:drawn',
                filter(ctx, [event], eventName) {
                  return trigger.params.card.length
                    ? getCards({
                        ...ctx,
                        conditions: trigger.params.card,
                        event,
                        eventName
                      }).some(card => card === event)
                    : true;
                }
              });
            })
            .with({ type: 'on_card_replaced' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'card:replaced',
                filter(ctx, [event], eventName) {
                  return trigger.params.card.length
                    ? getCards({
                        ...ctx,
                        conditions: trigger.params.card,
                        event,
                        eventName
                      }).some(card => card === event)
                    : true;
                }
              });
            })
            .with({ type: 'on_player_turn_start' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'player:turn_start',
                filter(ctx, [event], eventName) {
                  return trigger.params.player.length
                    ? getPlayers({
                        ...ctx,
                        event,
                        eventName,
                        conditions: trigger.params.player
                      }).some(player => player.equals(event))
                    : true;
                }
              });
            })
            .with({ type: 'on_player_turn_end' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'player:turn_end',
                filter(ctx, [event], eventName) {
                  return trigger.params.player.length
                    ? getPlayers({
                        ...ctx,
                        event,
                        eventName,
                        conditions: trigger.params.player
                      }).some(player => player.equals(event))
                    : true;
                }
              });
            })
            .with({ type: 'on_artifact_equiped' }, trigger => {
              return getEffectModifier({
                actions,
                frequency: trigger.params.frequency,
                eventName: 'artifact:equiped',
                filter(ctx, [event], eventName) {
                  return trigger.params.card.length
                    ? getCards({
                        ...ctx,
                        event,
                        eventName,
                        conditions: trigger.params.card
                      }).some(card => event.card === card)
                    : true;
                }
              });
            })
            .exhaustive()
        );
      }
    )
    .exhaustive();
};

const cache = new Map<string, CardBlueprint>();
export const parseSerializeBlueprint = <T extends GenericCardEffect[]>(
  blueprint: SerializedBlueprint<T>,
  format: GameFormat = { config: defaultConfig, cards: CARDS },
  { noCache }: { noCache: boolean } = { noCache: false }
) => {
  const cacheKey = `${blueprint.id}:${JSON.stringify(format)}`;
  if (cache.has(cacheKey) && !noCache) {
    return cache.get(cacheKey)!;
  }
  // first, parse the blueprint effects
  const effects = blueprint.effects.map(effect => ({
    ...effect,
    actions: parseSerializedBlueprintEffect(effect)
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
        .with('trigger_while_in_hand', () => {
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
    shouldHighlightCell(
      point: Point3D,
      options: {
        session: GameSession;
        playedPoint?: Point3D;
        targets: Point3D[];
        card: Card;
      }
    ) {
      if (!blueprint.cellHighlights || !blueprint.cellHighlights.length) {
        return match(blueprint.kind)
          .with(CARD_KINDS.MINION, CARD_KINDS.GENERAL, CARD_KINDS.ARTIFACT, () => false)
          .with(CARD_KINDS.SPELL, () => {
            return options.targets.some(target => Vec3.fromPoint3D(point).equals(target));
          })
          .exhaustive();
      }

      return getCells({
        session: options.session,
        event: {},
        card: options.card,
        targets: options.targets,
        conditions: blueprint.cellHighlights,
        playedPoint: options.playedPoint
      }).some(cell => {
        return cell.position.equals(point);
      });
    },
    async onPlay(ctx: EffectCtx) {
      for (const effect of effects) {
        await match(effect.config.executionContext)
          .with('trigger_while_on_board', async () => {
            for (const action of effect.actions) {
              if (!action.getEntityModifier) return;
              const entityModifier = action.getEntityModifier(ctx);

              whileOnBoard({
                entity: getEffectCtxEntity(ctx),
                source: ctx.card,
                onApplied(session, attachedTo) {
                  attachedTo.addModifier(entityModifier);
                },
                onRemoved(session, attachedTo) {
                  attachedTo.removeModifier(entityModifier.id);
                }
              });
            }
          })
          .with('while_equiped', () => {
            effect.actions.forEach(action => {
              if (!action.getEntityModifier) return;
              const entityModifier = action.getEntityModifier(ctx);

              whileEquipped({ artifact: ctx.artifact!, modifier: entityModifier });
            });
          })
          .with('immediate', 'while_on_board', async () => {
            for (const action of effect.actions) {
              await action.onPlay?.(ctx);
            }
          })
          .otherwise(() => {
            return;
          });
      }
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
        speed: format.config.UNIT_DEFAULT_SPEED,
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

  if (!noCache) {
    cache.set(cacheKey, withStats);
  }

  return withStats;
};
