import { Vec3 } from '@game/shared';
import { config } from '../../../config';
import { isEnemy, isAllyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-utils';

export const f1TutorialGeneral: CardBlueprint = {
  id: 'f1_tutorial_general',
  name: 'F1 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  factions: [FACTIONS.F1, FACTIONS.F1, FACTIONS.F1],
  spriteId: 'f1_general',
  kind: CARD_KINDS.GENERAL,
  cooldown: 0,
  initialCooldown: 0,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: 25,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  skills: [
    {
      id: 'f1_tutorial_general_skill_1',
      cooldown: 3,
      description: 'Give 1 attack to an ally minion.',
      name: 'Tutorial skill 1',
      iconId: 'wind',
      initialCooldown: 0,
      isTargetable(point, { session }) {
        return isAllyMinion(
          session,
          session.entitySystem.getEntityAt(point)?.id,
          session.playerSystem.activePlayer.id
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        const vec = Vec3.fromPoint3D(point);
        return castPoints.some(p => vec.equals(p));
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      onUse({ affectedCells }) {
        affectedCells.forEach(cell => {
          if (cell.entity) {
            cell.entity.addInterceptor('attack', atk => atk + 1);
          }
        });
      }
    }
  ]
};
