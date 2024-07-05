import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import { isWithinCells } from '../../../utils/targeting';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierGameEventMixin } from '../../../modifier/mixins/game-event.mixin';
import { TRIBES } from '../../../utils/tribes';
import { structure, surge } from '../../../modifier/modifier-utils';
import type { Entity } from '../../../entity/entity';
import type { GameSession } from '../../../game-session';

const dealDamage = (session: GameSession, entity: Entity) => {
  session.entitySystem.getNearbyEnemies(entity).forEach(enemy => {
    entity.dealDamage(1, enemy);
  });
};

export const f1ElementalConfluence: CardBlueprint = {
  id: 'f1_elemental_confluence',
  name: 'F1 Elemental Conduit',
  description:
    '@Structure@.\n@Call to Arms@ and start of turn: Deal 1 damage to nearby enemies. @Surge(1)@ for every Elemental you control.',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: FACTIONS.F1,
  factions: {
    f1: 3
  },
  spriteId: 'f1_elemental_confluence',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 0,
  maxHp: 6,
  speed: 0,
  range: 1,
  isWithinDangerZone(point, { entity }) {
    return isWithinCells(point, entity.position, 2);
  },
  keywords: [KEYWORDS.STRUCTURE, KEYWORDS.CALL_TO_ARMS, KEYWORDS.SURGE],
  onPlay({ entity, session }) {
    entity.addModifier(structure(entity));

    const isAlliedElemental = (e: Entity) =>
      e.isAlly(entity.id) &&
      e.card.blueprint.tribes?.some(tribe => tribe.id === TRIBES.ELEMENTAL.id);

    entity.addModifier(
      surge({
        source: entity,
        stacks: session.entitySystem.getList().filter(isAlliedElemental).length
      })
    );

    const onEntityCreated = (newEntity: Entity) => {
      if (isAlliedElemental(newEntity)) entity.addModifier(surge({ source: entity }));
    };
    const onEntityDestroyed = (newEntity: Entity) => {
      if (isAlliedElemental(newEntity)) entity.removeModifier(KEYWORDS.SURGE.id);
    };

    entity.addModifier(
      createEntityModifier({
        source: entity,
        visible: false,
        stackable: false,
        mixins: [
          {
            onApplied(session) {
              session.on('entity:created', onEntityCreated);
              session.on('entity:after_destroy', onEntityDestroyed);
            },
            onRemoved(session) {
              session.off('entity:created', onEntityCreated);
              session.off('entity:after_destroy', onEntityDestroyed);
            }
          }
        ]
      })
    );

    entity.addModifier(
      createEntityModifier({
        stackable: false,
        visible: true,
        name: 'Elemental Vortex',
        description: 'Start of turn: Deal 1 damage to nearby enemies.',
        source: entity,
        mixins: [
          modifierGameEventMixin({
            eventName: 'player:turn_start',
            listener([player], ctx) {
              if (!player.equals(entity.player)) return;
              dealDamage(session, entity);
            }
          })
        ]
      })
    );
    session.actionSystem.schedule(() => {
      dealDamage(session, entity);
    });
  }
};
