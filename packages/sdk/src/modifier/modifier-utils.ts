import type { MaybePromise, Point3D } from '@game/shared';
import { type Cell } from '../board/cell';
import type { GameSession } from '../game-session';
import { Entity, ENTITY_EVENTS, type EntityId } from '../entity/entity';
import { createEntityModifier, type EntityModifier } from '../modifier/entity-modifier';
import { modifierCardInterceptorMixin } from '../modifier/mixins/card-interceptor.mixin';
import { modifierEntityInterceptorMixin } from '../modifier/mixins/entity-interceptor.mixin';
import { KEYWORDS, type Keyword } from '../utils/keywords';
import { createCardModifier } from './card-modifier';
import { modifierGameEventMixin } from './mixins/game-event.mixin';
import { modifierEntityDurationMixin } from './mixins/duration.mixin';
import { isWithinCells } from '../utils/targeting';
import { modifierSelfEventMixin } from './mixins/self-event.mixin';
import { INTERCEPTOR_PRIORITIES } from '../card/card-enums';
import { Card, CARD_EVENTS } from '../card/card';
import { Unit } from '../card/unit';

export const dispelEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    entity.removeModifier(modifier.id);
  });
};

export const cleanseEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    if (!modifier.source.player.equals(entity.player)) {
      entity.removeModifier(modifier.id);
    }
  });
};

export const purgeEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    if (modifier.source.player.equals(entity.player)) {
      entity.removeModifier(modifier.id);
    }
  });
};

export const dispelCell = (cell: Cell) => {
  cell.removeTile();
  if (cell.entity) {
    dispelEntity(cell.entity);
  }
};

export const dispelAt = (session: GameSession, point: Point3D) => {
  const cell = session.boardSystem.getCellAt(point);
  if (cell) {
    dispelCell(cell);
  }
};

export const rush = () => {
  return createCardModifier({
    id: KEYWORDS.RUSH.id,
    stackable: false,
    mixins: [
      modifierCardInterceptorMixin({
        key: 'canMoveAfterSummon',
        interceptor: () => () => true,
        keywords: [KEYWORDS.RUSH]
      }),
      modifierCardInterceptorMixin({
        key: 'canAttackAfterSummon',
        interceptor: () => () => true,
        keywords: [KEYWORDS.RUSH]
      })
    ]
  });
};

export const burn = ({
  duration,
  source,
  stacks = 1
}: {
  source: Entity;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.BURN.id,
    source,
    visible: false,
    stackable: true,
    stacks,
    mixins: [
      modifierGameEventMixin({
        duration,
        eventName: 'player:turn_start',
        keywords: [KEYWORDS.BURN],
        listener([player], ctx) {
          if (ctx.attachedTo.player.equals(player)) {
            ctx.attachedTo.takeDamage(ctx.modifier.stacks!, source);
          }
        }
      })
    ]
  });
};

export const regeneration = ({
  duration,
  source,
  stacks = 1
}: {
  source: Entity;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.REGENERATION.id,
    source,
    visible: false,
    stackable: true,
    stacks,
    mixins: [
      modifierGameEventMixin({
        duration,
        eventName: 'player:turn_start',
        keywords: [KEYWORDS.REGENERATION],
        listener([player], ctx) {
          if (ctx.attachedTo.player.equals(player)) {
            ctx.attachedTo.heal(ctx.modifier.stacks!, source);
          }
        }
      })
    ]
  });
};

export const provoked = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  const moveInterceptor = () => false;
  const attackInterceptor = (value: boolean) => {
    // if entity already can't attack, do nothing
    if (!value) return value;

    return true;
  };

  let onMove: () => void;
  const cleanup = (session: GameSession, attachedTo: Entity) => {
    attachedTo.removeInterceptor('canMove', moveInterceptor);
    attachedTo.removeInterceptor('canAttack', attackInterceptor);
    session.off('entity:after-move', onMove);
  };

  const modifier = createEntityModifier({
    source,
    visible: true,
    name: 'Taunted',
    description: KEYWORDS.PROVOKED.description,
    stackable: false,
    mixins: [
      modifierEntityDurationMixin({
        keywords: [KEYWORDS.PROVOKED],
        duration,
        tickOn: 'end',
        onApplied(session, attachedTo) {
          attachedTo.addInterceptor('canMove', moveInterceptor);
          attachedTo.addInterceptor('canAttack', attackInterceptor);
          onMove = () => {
            if (!isWithinCells(source.position, attachedTo.position, 1)) {
              cleanup(session, attachedTo);
              session.on('entity:after-move', onMove);
            }
          };
          session.on('entity:after-move', onMove);
          source.once('after_destroy', () => cleanup(session, attachedTo));
        },
        onRemoved(session, attachedTo) {
          cleanup(session, attachedTo);
        }
      })
    ]
  });

  return modifier;
};

export const fearsome = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    source,
    id: KEYWORDS.FEARSOME.id,
    stackable: false,
    visible: false,
    mixins: [
      modifierSelfEventMixin({
        eventName: 'before_attack',
        keywords: [KEYWORDS.FEARSOME],
        duration,
        listener([event]) {
          const unsub = event.target.addInterceptor('canRetaliate', () => false);
          event.entity.once('after_attack', unsub);
        }
      })
    ]
  });
};

export const flying = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.FLYING.id,
    source,
    visible: false,
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canMoveThroughCell',
        keywords: [KEYWORDS.FLYING],
        duration,
        interceptor: () => () => {
          return true;
        }
      })
    ]
  });
};

export const frozen = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  const interceptor = () => false;

  const cleanup = (attachedTo: Entity) => {
    attachedTo.removeInterceptor('canMove', interceptor);
    attachedTo.removeInterceptor('canAttack', interceptor);
  };

  return createEntityModifier({
    id: KEYWORDS.FROZEN.id,
    visible: false,
    stackable: false,
    source,
    mixins: [
      modifierEntityDurationMixin({
        duration,
        keywords: [KEYWORDS.FROZEN],
        onApplied(session, attachedTo) {
          attachedTo.addInterceptor('canAttack', interceptor);
          attachedTo.addInterceptor('canMove', interceptor);
          attachedTo.once('after_take_damage', () => cleanup(attachedTo));
        },
        onRemoved(session, attachedTo) {
          cleanup(attachedTo);
        }
      })
    ]
  });
};

export const rooted = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.ROOTED.id,
    visible: false,
    stackable: false,
    source,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canMove',
        duration,
        interceptor: () => () => false,
        keywords: [KEYWORDS.ROOTED]
      })
    ]
  });
};

export const celerity = ({ source, duration }: { source: Entity; duration?: number }) => {
  return createEntityModifier({
    source,
    id: KEYWORDS.CELERITY.id,
    visible: false,
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'maxMovements',
        interceptor: () => () => 2,
        duration,
        tickOn: 'start',
        keywords: [KEYWORDS.CELERITY]
      }),
      modifierEntityInterceptorMixin({
        key: 'maxAttacks',
        interceptor: () => () => 2,
        duration,
        tickOn: 'start',
        keywords: [KEYWORDS.CELERITY]
      })
    ]
  });
};

export const structure = (source: Entity) => {
  return createEntityModifier({
    source,
    id: KEYWORDS.STRUCTURE.id,
    visible: false,
    stackable: false,
    mixins: [
      {
        keywords: [KEYWORDS.STRUCTURE],
        onApplied(session, attachedTo) {
          attachedTo.addInterceptor(
            'canAttack',
            () => false,
            INTERCEPTOR_PRIORITIES.FINAL
          );
          attachedTo.addInterceptor('canMove', () => false, INTERCEPTOR_PRIORITIES.FINAL);
          attachedTo.addInterceptor(
            'canRetaliate',
            () => false,
            INTERCEPTOR_PRIORITIES.FINAL
          );
          attachedTo.addInterceptor('attack', () => 0, INTERCEPTOR_PRIORITIES.FINAL);
        }
      }
    ]
  });
};

export const ranged = ({ source, duration }: { source: Entity; duration?: number }) => {
  return createEntityModifier({
    source,
    id: KEYWORDS.RANGED.id,
    stackable: false,
    visible: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'range',
        duration,
        keywords: [KEYWORDS.RANGED],
        interceptor: () => () => Infinity
      })
    ]
  });
};

export const barrier = ({ source, duration }: { source: Entity; duration?: number }) => {
  return createEntityModifier({
    id: KEYWORDS.BARRIER.id,
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'damageTaken',
        interceptor: () => () => 0,
        priority: INTERCEPTOR_PRIORITIES.FINAL,
        keywords: [KEYWORDS.BARRIER],
        duration
      }),
      modifierSelfEventMixin({
        eventName: 'after_take_damage',
        once: true,
        duration,
        listener(event, { attachedTo }) {
          attachedTo.removeModifier(KEYWORDS.BARRIER.id);
        }
      })
    ]
  });
};

export const aura = ({
  source,
  name,
  description,
  onGainAura,
  onLoseAura,
  keywords = [],
  isElligible = (target, source) => isWithinCells(source.position, target.position, 1)
}: {
  source: Entity;
  name: string;
  description: string;
  onGainAura: (entity: Entity) => void;
  onLoseAura: (entity: Entity) => void;
  keywords?: Keyword[];
  isElligible?: (target: Entity, source: Entity) => boolean;
}) => {
  const affectedEntitiesIds = new Set<EntityId>();

  const cleanup = (session: GameSession) => {
    affectedEntitiesIds.forEach(id => {
      const entity = session.entitySystem.getEntityById(id);
      if (!entity) return;

      onLoseAura(entity);
    });
  };

  const checkAura = (session: GameSession, attachedTo: Entity) => {
    session.entitySystem.getList().forEach(entity => {
      if (entity.equals(attachedTo)) return;
      const shouldGetAura = isElligible(entity, attachedTo);

      const hasAura = affectedEntitiesIds.has(entity.id);

      if (!shouldGetAura && hasAura) {
        affectedEntitiesIds.delete(entity.id);
        onLoseAura(entity);
        return;
      }

      if (shouldGetAura && !hasAura) {
        affectedEntitiesIds.add(entity.id);
        onGainAura(entity);
        return;
      }
    });
  };
  return createEntityModifier({
    source,
    stackable: false,
    visible: true,
    name,
    description,
    mixins: [
      {
        keywords,
        onApplied(session, attachedTo) {
          const doCheck = () => checkAura(session, attachedTo);
          doCheck();
          session.on('entity:created', doCheck);
          session.on('entity:after_destroy', doCheck);
          session.on('entity:after-move', doCheck);

          attachedTo.once('after_destroy', () => {
            session.off('entity:created', doCheck);
            session.off('entity:after_destroy', doCheck);
            session.off('entity:after-move', doCheck);
            cleanup(session);
          });
        },
        onRemoved(session) {
          cleanup(session);
        }
      }
    ]
  });
};

export const whileOnBoard = ({
  source,
  entity,
  onApplied,
  onRemoved
}: {
  entity: Entity;
  source: Entity;
  onApplied: EntityModifier['onApplied'];
  onRemoved: EntityModifier['onRemoved'];
}) => {
  entity.addModifier(
    createEntityModifier({
      source,
      stackable: false,
      visible: false,
      mixins: [
        {
          onApplied(session, attachedTo, modifier) {
            onApplied(session, attachedTo, modifier);
            attachedTo.once(ENTITY_EVENTS.BEFORE_DESTROY, () => {
              onRemoved(session, attachedTo, modifier);
            });
          },
          onRemoved
        }
      ]
    })
  );
};

export const whileInHand = (
  card: Card,
  cb: (card: Card) => any,
  cleanup: (card: Card) => any
) => {
  card.on(CARD_EVENTS.DRAWN, cb);
  const unsub = () => {
    cleanup(card);
    card.off(CARD_EVENTS.AFTER_PLAYED, unsub);
    card.off(CARD_EVENTS.REPLACED, unsub);
  };
  card.on(CARD_EVENTS.AFTER_PLAYED, unsub);
  card.on(CARD_EVENTS.REPLACED, unsub);
};

export const whileInDeck = (
  card: Card,
  cb: (card: Card) => any,
  cleanup: (card: Card) => any
) => {
  cb(card);
  card.on(CARD_EVENTS.REPLACED, cb);
  card.on(CARD_EVENTS.DRAWN, cleanup);
};

export const dyingWish = ({
  source,
  handler,
  keywords = []
}: {
  source: Entity;
  keywords?: Keyword[];
  handler: (
    entity: Entity,
    ctx: { session: GameSession; modifier: EntityModifier }
  ) => MaybePromise<void>;
}) => {
  return createEntityModifier({
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierSelfEventMixin({
        eventName: 'before_destroy',
        keywords: [...keywords, KEYWORDS.DYING_WISH],
        listener([event], ctx) {
          return handler(event, ctx);
        }
      })
    ]
  });
};

export const openingGambit = ({
  source,
  handler,
  keywords = []
}: {
  source: Entity;
  keywords?: Keyword[];
  handler: (
    entity: Entity,
    ctx: { session: GameSession; modifier: EntityModifier }
  ) => MaybePromise<void>;
}) => {
  return createEntityModifier({
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierSelfEventMixin({
        eventName: 'created',
        keywords: [...keywords, KEYWORDS.OPENING_GAMBIT],
        listener([event], ctx) {
          return handler(event, ctx);
        }
      })
    ]
  });
};

export const deathWatch = ({
  source,
  handler
}: {
  source: Entity;
  handler: (
    entity: Entity,
    ctx: { session: GameSession; modifier: EntityModifier }
  ) => MaybePromise<void>;
}) => {
  return createEntityModifier({
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierGameEventMixin({
        eventName: 'entity:after_destroy',
        listener([event], ctx) {
          return handler(event, ctx);
        }
      })
    ]
  });
};

export const airdrop = () =>
  createCardModifier({
    id: 'airdrop',
    stackable: false,

    mixins: [
      {
        keywords: [KEYWORDS.AIRDROP],
        onApplied(session, attachedTo) {
          if (!(attachedTo instanceof Unit)) {
            console.warn('Airdrop only works on units !');
            return;
          }
          attachedTo.addInterceptor(
            'canPlayAt',
            (value, { point }) => !session.entitySystem.getEntityAt(point)
          );
        }
      }
    ]
  });
