import type { Point3D } from '@game/shared';
import type { Cell } from '../board/cell';
import type { GameSession } from '../game-session';
import { Entity } from '../entity/entity';
import { createEntityModifier } from '../modifier/entity-modifier';
import { modifierCardInterceptorMixin } from '../modifier/mixins/card-interceptor.mixin';
import { modifierEntityInterceptorMixin } from '../modifier/mixins/entity-interceptor.mixin';
import { KEYWORDS } from '../utils/keywords';
import { createCardModifier } from './card-modifier';
import { modifierGameEventMixin } from './mixins/game-event.mixin';
import { modifierEntityDurationMixin } from './mixins/duration.mixin';
import { isWithinCells } from '../utils/targeting';

export const dispelEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    entity.removeModifier(modifier.id);
  });
};

export const cleanseEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    if (modifier.source.player.equals(entity.player)) {
      entity.removeModifier(modifier.id);
    }
  });
};

export const curseEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    if (!modifier.source.player.equals(entity.player)) {
      entity.removeModifier(modifier.id);
    }
  });
};

export const dispelCell = (cell: Cell) => {
  cell.tile = null;
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
  source
}: {
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    visible: false,
    stackable: true,
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

export const tough = ({ duration, source }: { source: Entity; duration?: number }) => {
  return createEntityModifier({
    visible: false,
    stackable: true,
    source,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'damageTaken',
        interceptor: modifier => amount => Math.max(amount - modifier.stacks!, 1),
        tickOn: 'start',
        duration,
        keywords: [KEYWORDS.VULNERABLE]
      })
    ]
  });
};

export const rush = () => {
  return createCardModifier({
    mixins: [
      modifierCardInterceptorMixin({
        key: 'shouldExhaustOnPlay',
        interceptor: () => () => false,
        keywords: [KEYWORDS.RUSH]
      })
    ]
  });
};

export const burn = ({ duration, source }: { source: Entity; duration?: number }) => {
  return createEntityModifier({
    source,
    visible: false,
    stackable: true,
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
  source
}: {
  source: Entity;
  duration?: number;
}) => {
  return createEntityModifier({
    source,
    visible: false,
    stackable: true,
    mixins: [
      modifierGameEventMixin({
        duration,
        eventName: 'player:turn_start',
        keywords: [KEYWORDS.BURN],
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

  let onMove: (entity: Entity) => void;
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
        tickOn: 'end',
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
      modifierEntityDurationMixin({
        duration,
        onApplied() {},
        onRemoved() {},
        keywords: [KEYWORDS.NIMBLE]
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
          attachedTo.addInterceptor('canAttack', interceptor);
          attachedTo.once('after_take_damage', () => cleanup(attachedTo));
        },
        onRemoved(session, attachedTo) {
          cleanup(attachedTo);
        }
      })
    ]
  });
};
