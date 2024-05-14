import { Vec3 } from '@game/shared';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { isAxisAligned, isSelf, isWithinCells } from '../../../utils/targeting';
import { celerity, fury, nimble } from '../../../modifier/modifier-utils';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../../modifier/mixins/entity-interceptor.mixin';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Dancer: CardBlueprint = {
  id: 'f1_dancer',
  name: 'F1 Dancer',
  description: '@Nimble@.',
  collectable: true,
  rarity: RARITIES.EPIC,
  factions: [FACTIONS.F1, FACTIONS.F1, null],
  spriteId: 'f1_dancer',
  kind: CARD_KINDS.MINION,
  cooldown: 6,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 9,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.NIMBLE],
  onPlay({ entity }) {
    entity.addModifier(nimble({ source: entity }));
  },
  skills: [
    {
      id: 'f1_dancer_skill_1',
      cooldown: 4,
      description: 'Gain @Fury@ and @Celerity@ 2 turns',
      name: 'Battle dance',
      iconId: 'chakram-dance',
      initialCooldown: 0,
      minTargetCount: 0,
      maxTargetCount: 1,
      keywords: [KEYWORDS.FURY, KEYWORDS.CELERITY],
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      onUse({ skill, affectedCells }) {
        skill.caster.addModifier(fury({ source: skill.caster, duration: 2 }));
        skill.caster.addModifier(celerity({ source: skill.caster, duration: 2 }));
      }
    }
  ]
};
