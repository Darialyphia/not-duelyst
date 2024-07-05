import { structure } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';
import { f2Imp } from './imp';
import { f2Ravager } from './ravager';

export const f2Overseer: CardBlueprint = {
  id: 'f2_overseer',
  name: 'F2 Overseer',
  description: `@Structure@.\n@Call to Arms@: Destroy an allied @${f2Imp.name}@ to @Summon@ a @${f2Ravager.name}@ in its place.`,
  collectable: true,
  rarity: RARITIES.LEGENDARY,
  faction: FACTIONS.F2,
  factions: { f2: 3 },
  spriteId: 'f2_demon_eye',
  kind: CARD_KINDS.MINION,
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
  onPlay({ session, followup, entity }) {
    entity.addModifier(structure(entity));

    const [point] = followup;
    if (!point) return;

    const imp = session.entitySystem.getEntityAt(point);
    if (!imp) return;

    const position = imp.position.clone();
    imp.destroy();

    const card = entity.player.generateCard({
      blueprintId: f2Ravager.id,
      pedestalId: entity.card.pedestalId
    });

    card.play({
      position,
      targets: []
    });
  }
};
