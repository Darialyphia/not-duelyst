import { TERRAINS } from '../../../board/board-utils';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierSelfEventMixin } from '../../../modifier/mixins/self-event.mixin';
import { ranged } from '../../../modifier/modifier-utils';
import { TRIBES } from '../../../utils/tribes';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralWaterElemental: CardBlueprint = {
  id: 'water-elemental',
  name: 'Neutral Water Elemental',
  description:
    '@Ranged(2)@\nTransform the tiles this unit passes through into water for 2 turns.',
  collectable: false,
  rarity: RARITIES.BASIC,
  faction: null,
  factions: {},
  spriteId: 'neutral_water_elemental',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 1,
  maxHp: 5,
  speed: 3,
  range: 1,
  tribes: [TRIBES.ELEMENTAL],
  onPlay({ entity }) {
    entity.addModifier(ranged({ range: 2, source: entity }));
    entity.addModifier(
      createEntityModifier({
        source: entity,
        visible: true,
        name: 'Torrential trail',
        description: 'Leaves a water trail along its path.',
        stackable: false,
        mixins: [
          modifierSelfEventMixin({
            eventName: 'after-move',
            listener([{ path, previousPosition }], { session }) {
              path
                .slice(0, -1)
                .concat(previousPosition)
                .forEach(point => {
                  const cell = session.boardSystem.getCellAt(point)!;
                  const originalTerrain = cell.terrain;
                  const originalSprite = cell.spriteId;

                  cell.terrain = TERRAINS.WATER;
                  cell.spriteId = 'water';
                  let count = 0;
                  const onTurnStart = () => {
                    count++;
                    if (count === 2) {
                      console.log('revert', originalTerrain, originalSprite);
                      cell.terrain = originalTerrain;
                      cell.spriteId = originalSprite;
                      entity.player.off('turn_start', onTurnStart);
                    }
                  };
                  entity.player.on('turn_start', onTurnStart);
                });
            }
          })
        ]
      })
    );
  }
};
