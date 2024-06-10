import type { Entity } from '../../../entity/entity';
import { getCellBehind, getCellInFront, isEmpty } from '../../../entity/entity-utils';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../../modifier/mixins/entity-interceptor.mixin';
import { whileOnBoard } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { isSelf } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';
import { f2Imp } from './imp';

const PIT_LORD_MODIFIER_ID = 'pit_lord_modifier';

export const f2PitLord: CardBlueprint = {
  id: 'f2_pit_lord',
  name: 'F2 Pit Lord',
  description: `Allied @${f2Imp.name}@ have +2 health.`,
  collectable: true,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F2,
  factions: { f2: 2 },
  spriteId: 'f2_pit_lord',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 2,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.RUSH],
  relatedBlueprintIds: [f2Imp.id],
  async onPlay({ session, entity }) {
    const isAlliedImp = (e: Entity) =>
      e.isAlly(entity.id) && e.card.blueprintId === f2Imp.id;

    const getModifier = () => {
      return createEntityModifier({
        id: PIT_LORD_MODIFIER_ID,
        stackable: true,
        visible: true,
        name: 'Pit Lord buff',
        description: `+2 health`,
        source: entity,
        mixins: [
          modifierEntityInterceptorMixin({
            key: 'maxHp',
            interceptor: modifier => hp => hp + 2 * modifier.stacks!,
            keywords: []
          })
        ]
      });
    };
    const onEntityCreated = (newEntity: Entity) => {
      if (!isAlliedImp(newEntity)) return;
      newEntity.addModifier(getModifier());
    };

    entity.addModifier(
      whileOnBoard({
        source: entity,
        onApplied() {
          session.on('entity:created', onEntityCreated);
          session.entitySystem.getList().forEach(e => {
            if (!isAlliedImp(e)) return;
            e.addModifier(getModifier());
          });
        },
        onRemoved(session) {
          session.off('entity:created', onEntityCreated);

          session.entitySystem.getList().forEach(e => {
            if (!isAlliedImp(e)) return;
            e.removeModifier(PIT_LORD_MODIFIER_ID);
          });
        }
      })
    );
  },
  skills: [
    {
      id: 'f2_pit_lord_skill1',
      name: 'F2 Pit Lord Skill1',
      description: `@Summon@ an @${f2Imp.name}@ behind and in front of this unit.`,
      iconId: 'imps',
      initialCooldown: 0,
      cooldown: 4,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { skill, session }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        if (!isEmpty(session, point)) return false;
        return [
          getCellInFront(session, skill.caster),
          getCellBehind(session, skill.caster)
        ].some(cell => cell?.position.equals(point));
      },
      async onUse({ skill, affectedCells }) {
        await Promise.all(
          affectedCells.map(cell => {
            const imp = skill.caster.player.generateCard({
              blueprintId: f2Imp.id,
              pedestalId: skill.caster.card.pedestalId
            });

            return imp.play({ position: cell.position, targets: [] });
          })
        );
      }
    }
  ]
};
