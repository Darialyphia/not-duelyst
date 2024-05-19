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
import { TERRAINS } from '../board/board-utils';

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

export const vigilant = ({ duration, source }: { source: Entity; duration?: number }) => {
  return createEntityModifier({
    id: KEYWORDS.VIGILANT.id,
    visible: false,
    stackable: false,
    source,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'maxRetalitions',
        interceptor: () => () => Infinity,
        duration,
        keywords: [KEYWORDS.VIGILANT]
      })
    ]
  });
};

export const vulnerable = ({
  duration,
  source,
  stacks = 1
}: {
  source: Entity;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.VULNERABLE.id,
    visible: false,
    stackable: true,
    stacks,
    source,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'damageTaken',
        interceptor: modifier => amount => amount + modifier.stacks!,
        tickOn: 'start',
        duration,
        keywords: [KEYWORDS.VULNERABLE]
      })
    ]
  });
};

export const tough = ({
  duration,
  source,
  stacks = 1
}: {
  source: Entity;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.TOUGH.id,
    visible: false,
    stackable: true,
    stacks,
    source,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'damageTaken',
        interceptor: modifier => amount => {
          console.log(modifier);
          return Math.max(amount - modifier.stacks!, 1);
        },
        tickOn: 'start',
        duration,
        keywords: [KEYWORDS.TOUGH]
      })
    ]
  });
};

export const rush = () => {
  return createCardModifier({
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

export const channel = (source: Entity) => {
  return createEntityModifier({
    source,
    visible: true,
    name: 'Channeling',
    description: 'This unit is channeling and cannot move anymore this turn.',
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canMove',
        interceptor: () => () => false,
        duration: 1,
        tickOn: 'end',
        keywords: [KEYWORDS.CHANNELING]
      })
    ]
  });
};

export const taunted = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  const moveInterceptor = () => false;
  const skillInterceptor = () => false;
  const attackInterceptor = (
    value: boolean,
    { target, entity }: { target: Entity; entity: Entity }
  ) => {
    // if entity already can't attack, do nothing
    if (!value) return value;

    return true;
  };

  let onMove: () => void;
  const cleanup = (session: GameSession, attachedTo: Entity) => {
    attachedTo.removeInterceptor('canMove', moveInterceptor);
    attachedTo.removeInterceptor('canUseSkill', skillInterceptor);
    attachedTo.removeInterceptor('canAttack', attackInterceptor);
    session.off('entity:after-move', onMove);
  };

  const modifier = createEntityModifier({
    source,
    visible: true,
    name: 'Taunted',
    description: KEYWORDS.TAUNTED.description,
    stackable: false,
    mixins: [
      modifierEntityDurationMixin({
        keywords: [KEYWORDS.TAUNTED],
        duration,
        tickOn: 'start',
        onApplied(session, attachedTo, modifier) {
          attachedTo.addInterceptor('canMove', moveInterceptor);
          attachedTo.addInterceptor('canUseSkill', skillInterceptor);
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
        onRemoved(session, attachedTo, modifier) {
          cleanup(session, attachedTo);
        }
      })
    ]
  });

  return modifier;
};

export const nimble = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    source,
    visible: false,
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canMoveThroughCell',
        duration,
        keywords: [KEYWORDS.NIMBLE],
        interceptor:
          () =>
          (val, { cell }) => {
            if (cell.terrain === TERRAINS.WATER) return false;
            return true;
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
    source,
    visible: false,
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canMoveThroughCell',
        keywords: [KEYWORDS.FLYING],
        interceptor: () => val => {
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
    attachedTo.removeInterceptor('canUseSkill', interceptor);
    attachedTo.removeInterceptor('canAttack', interceptor);
  };

  return createEntityModifier({
    visible: false,
    stackable: false,
    source,
    mixins: [
      modifierEntityDurationMixin({
        duration,
        keywords: [KEYWORDS.FROZEN],
        onApplied(session, attachedTo) {
          attachedTo.addInterceptor('canAttack', interceptor);
          attachedTo.addInterceptor('canUseSkill', interceptor);
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

export const silenced = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    visible: false,
    stackable: false,
    source,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canUseSkill',
        duration,
        interceptor: () => () => false,
        keywords: [KEYWORDS.SILENCED]
      })
    ]
  });
};

export const disarmed = ({
  source,
  duration = Infinity
}: {
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    visible: false,
    stackable: false,
    source,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canAttack',
        duration,
        interceptor: () => () => false,
        keywords: [KEYWORDS.DISARMED]
      })
    ]
  });
};

export const thorns = ({
  source,
  duration = Infinity,
  stacks = 1
}: {
  source: Entity;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.THORNS.id,
    source,
    visible: false,
    stackable: true,
    stacks,
    mixins: [
      modifierSelfEventMixin({
        eventName: 'after_take_damage',
        duration,
        tickOn: 'start',
        keywords: [KEYWORDS.THORNS],
        listener([event], ctx) {
          ctx.attachedTo.dealDamage(ctx.modifier.stacks!, event.source);
        }
      })
    ]
  });
};

export const fury = ({ source, duration }: { source: Entity; duration?: number }) => {
  return createEntityModifier({
    source,
    visible: false,
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'maxAttacks',
        interceptor: () => () => 2,
        duration,
        keywords: [KEYWORDS.FURY]
      })
    ]
  });
};

export const celerity = ({ source, duration }: { source: Entity; duration?: number }) => {
  return createEntityModifier({
    source,
    visible: false,
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'maxMovements',
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
    visible: false,
    stackable: false,
    mixins: [
      {
        keywords: [KEYWORDS.STRUCTURE],
        onApplied(session, attachedTo, modifier) {
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

export const ranged = ({
  range,
  source,
  duration
}: {
  range: number;
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'range',
        duration,
        keywords: [KEYWORDS.RANGED],
        interceptor: () => base => base + range
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

export const surge = ({
  source,
  duration,
  stacks = 1
}: {
  source: Entity;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.SURGE.id,
    source,
    stackable: true,
    visible: false,
    stacks,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'damageDealt',
        duration,
        keywords: [KEYWORDS.SURGE],
        interceptor:
          modifier =>
          (amount, { isAbilityDamage }) =>
            isAbilityDamage ? amount + modifier.stacks! : amount
      })
    ]
  });
};
export const elusive = ({
  source,
  duration
}: {
  source: Entity;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.SURGE.id,
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'damageTaken',
        keywords: [KEYWORDS.ELUSIVE],
        priority: INTERCEPTOR_PRIORITIES.FINAL,
        interceptor:
          modifier =>
          (amount, { isAbilityDamage }) =>
            isAbilityDamage ? amount : 0
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
  keywords = []
}: {
  source: Entity;
  name: string;
  description: string;
  onGainAura: (entity: Entity) => void;
  onLoseAura: (entity: Entity) => void;
  keywords?: Keyword[];
}) => {
  return createEntityModifier({
    source,
    stackable: false,
    visible: true,
    name,
    description,
    mixins: [
      {
        keywords: [...keywords, KEYWORDS.AURA],
        onApplied(session, attachedTo) {
          const affectedEntitiesIds = new Set<EntityId>();
          const checkAura = () => {
            session.entitySystem.getList().forEach(entity => {
              if (entity.equals(attachedTo)) return;
              const isNearby = isWithinCells(attachedTo.position, entity.position, 1);

              const hasAura = affectedEntitiesIds.has(entity.id);

              if (!isNearby && hasAura) {
                affectedEntitiesIds.delete(entity.id);
                onLoseAura(entity);
                return;
              }

              if (isNearby && !hasAura) {
                affectedEntitiesIds.add(entity.id);
                onGainAura(entity);
                return;
              }
            });
          };
          checkAura();
          session.on('entity:created', checkAura);
          session.on('entity:after_destroy', checkAura);
          session.on('entity:after-move', checkAura);

          attachedTo.once('after_destroy', () => {
            session.off('entity:created', checkAura);
            session.off('entity:after_destroy', checkAura);
            session.off('entity:after-move', checkAura);
          });
        }
      }
    ]
  });
};

export const whileOnBoard = ({
  source,
  onApplied,
  onRemoved
}: {
  source: Entity;
  onApplied: EntityModifier['onApplied'];
  onRemoved: EntityModifier['onRemoved'];
}) => {
  return createEntityModifier({
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
  });
};

export const lastWill = ({
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
      modifierSelfEventMixin({
        eventName: 'before_destroy',
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
