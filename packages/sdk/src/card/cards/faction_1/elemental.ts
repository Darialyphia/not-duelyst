import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1Elemental: CardBlueprint = {
  id: 'f1_placeholder',
  name: 'F1 Elemental',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  factions: [FACTIONS.F1, null, null],
  spriteId: 'f1_placeholder',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 3,
  attack: 2,
  maxHp: 6,
  speed: 3,
  range: 1,
  skills: [
    {
      id: 'f1_elemental_skill_1',
      cooldown: 2,
      description: 'Deal 1 to nearby enemies.',
      name: 'Test skill',
      iconId: 'natureblast2',
      initialCooldown: 0,
      isTargetable() {
        return true;
      },
      isInAreaOfEffect(point, { session, skill }) {
        return session.entitySystem
          .getNearbyEnemies(skill.caster)
          .some(entity => entity.position.equals(point));
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      onUse({ skill, affectedCells }) {
        affectedCells.forEach(cell => {
          if (cell.entity) {
            cell.entity.takeDamage(1, skill.caster);
          }
        });
      }
    }
  ]
};
