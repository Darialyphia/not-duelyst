import { isEmpty } from '../../../entity/entity-utils';
import { isCastPoint } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { neutralAirElemental } from '../neutral/air-elemental';
import { neutralEarthElemental } from '../neutral/earth-elemental';
import { neutralFireElemental } from '../neutral/fire-elemental';
import { neutralWaterElemental } from '../neutral/water-elemental';

export const f1ElementalLord: CardBlueprint = {
  id: 'f1_elemental_lord',
  name: 'F1 Elemental Lord',
  description: '',
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_elementalist',
  kind: CARD_KINDS.MINION,
  cooldown: 6,
  initialCooldown: 0,
  cost: 5,
  attack: 1,
  maxHp: 8,
  speed: 3,
  range: 1,
  keywords: [],
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
          session.boardSystem
            .getNeighbors3D(point)
            .some(cell => cell.entity?.isAlly(skill.caster.id))
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      onUse({ skill, castPoints, blueprintFollowup }) {
        const card = skill.caster.player.generateCard(
          blueprintFollowup[0].id,
          skill.caster.card.pedestalId
        );
        card.play({
          position: castPoints[0],
          targets: []
        });
      }
    }
  ]
};
