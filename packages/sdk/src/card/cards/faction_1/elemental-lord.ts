import type { Entity } from '../../../entity/entity';
import { isEmpty } from '../../../entity/entity-utils';
import { regeneration, whileOnBoard } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { isCastPoint, isWithinCells } from '../../../utils/targeting';
import { TRIBES } from '../../../utils/tribes';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';
import { neutralAirElemental } from '../neutral/air-elemental';
import { neutralEarthElemental } from '../neutral/earth-elemental';
import { neutralFireElemental } from '../neutral/fire-elemental';
import { neutralWaterElemental } from '../neutral/water-elemental';

export const f1ElementalLord: CardBlueprint = {
  id: 'f1_elemental_lord',
  name: 'F1 Elemental Lord',
  description: 'Your Elementals have @Regeneration(1)@',
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  faction: FACTIONS.F1,
  factions: { f1: 3 },
  spriteId: 'f1_elementalist',
  kind: CARD_KINDS.MINION,
  cost: 5,
  attack: 1,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.REGENERATION],
  onPlay({ session, entity }) {
    const isAlliedElemental = (e: Entity) =>
      e.isAlly(entity.id) &&
      e.card.blueprint.tribes?.some(tribe => tribe.id === TRIBES.ELEMENTAL.id);

    const onEntityCreated = (newEntity: Entity) => {
      if (!isAlliedElemental(newEntity)) return;
      newEntity.addModifier(regeneration({ source: entity }));
    };

    entity.addModifier(
      whileOnBoard({
        source: entity,
        onApplied() {
          session.on('entity:created', onEntityCreated);
          session.entitySystem.getList().forEach(e => {
            if (!isAlliedElemental(e)) return;
            e.addModifier(regeneration({ source: entity }));
          });
        },
        onRemoved(session) {
          session.off('entity:created', onEntityCreated);

          session.entitySystem.getList().forEach(e => {
            if (!isAlliedElemental(e)) return;
            e.removeModifier(KEYWORDS.REGENERATION.id);
          });
        }
      })
    );
  },
  relatedBlueprintIds: [
    neutralAirElemental.id,
    neutralEarthElemental.id,
    neutralFireElemental.id,
    neutralWaterElemental.id
  ],
  skills: [
    {
      id: 'f1_elemental_lord_skill1',
      name: 'Element Conjuration',
      description: `Summon a @${neutralAirElemental.name}@,@${neutralEarthElemental.name}@,@${neutralFireElemental.name}@ or @${neutralWaterElemental.name}@ nearby this unit.`,
      iconId: 'elements',
      cooldown: 3,
      initialCooldown: 0,
      minTargetCount: 1,
      maxTargetCount: 1,
      blueprintFollowup: {
        minChoices: 1,
        maxChoices: 1,
        getChoices() {
          return [
            neutralAirElemental,
            neutralEarthElemental,
            neutralFireElemental,
            neutralWaterElemental
          ];
        }
      },
      isTargetable(point, { session, skill }) {
        return (
          isEmpty(session, point) &&
          !!session.boardSystem.getCellAt(point)?.isWalkable &&
          isWithinCells(skill.caster.position, point, 1)
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      onUse({ skill, castPoints, blueprintFollowup }) {
        const card = skill.caster.player.generateCard({
          blueprintId: blueprintFollowup[0].id,
          pedestalId: skill.caster.card.pedestalId
        });
        card.play({
          position: castPoints[0],
          targets: []
        });
      }
    }
  ]
};
