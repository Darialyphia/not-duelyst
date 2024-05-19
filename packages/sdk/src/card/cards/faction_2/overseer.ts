import { isEnemyGeneral, isEnemyMinion } from '../../../entity/entity-utils';
import { structure } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { f2Imp } from './imp';
import { f2Ravager } from './ravager';

export const f2Overseer: CardBlueprint = {
  id: 'f2_overseer',
  name: 'F2 Overseer',
  description: `@Structure@\n.@Call to Arms@: Destroy an allied @${f2Imp.name}@ to @Summon@ a @${f2Ravager.name}@ in its place.`,
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  factions: [FACTIONS.F2, FACTIONS.F2, FACTIONS.F2],
  spriteId: 'f2_demon_eye',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 6,
  attack: 0,
  maxHp: 6,
  speed: 0,
  range: 1,
  relatedBlueprintIds: [f2Ravager.id, f2Imp.id],
  keywords: [KEYWORDS.STRUCTURE],
  followup: {
    minTargetCount: 0,
    maxTargetCount: 1,
    isTargetable(point, { session, card }) {
      const entity = session.entitySystem.getEntityAt(point);
      if (!entity) return false;

      return (
        entity.isAlly(card.player.general.id) && entity.card.blueprintId === f2Imp.id
      );
    }
  },
  async onPlay({ session, followup, entity }) {
    entity.addModifier(structure(entity));

    const [point] = followup;
    if (!point) return;

    const imp = session.entitySystem.getEntityAt(point);
    if (!imp) return;

    const position = imp.position.clone();
    await imp.destroy();

    const card = entity.player.generateCard({
      blueprintId: f2Ravager.id,
      pedestalId: entity.card.pedestalId
    });

    await card.play({
      position,
      targets: []
    });
  },
  skills: [
    {
      id: 'f2_overseer_skill1',
      name: 'F2 Overseer Skill 1',
      description: `Deal 1 damage to the enemy general for each ${f2Imp} you control.`,
      initialCooldown: 0,
      cooldown: 2,
      iconId: 'demon-eye',
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isEnemyGeneral(
          session,
          session.entitySystem.getEntityAt(point)?.id,
          skill.caster.player.id
        );
      },
      isInAreaOfEffect(point, { session, skill }) {
        return isEnemyGeneral(
          session,
          session.entitySystem.getEntityAt(point)?.id,
          skill.caster.player.id
        );
      },
      onUse({ skill }) {
        const imps = skill.caster.player.entities.filter(
          e => e.card.blueprintId === f2Imp.id
        );
        skill.caster.dealDamage(imps.length, skill.caster.player.opponent.general);
      }
    }
  ]
};
