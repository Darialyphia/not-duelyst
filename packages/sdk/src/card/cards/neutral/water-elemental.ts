import { TERRAINS } from '../../../board/board-utils';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierSelfEventMixin } from '../../../modifier/mixins/self-event.mixin';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralWaterElemental: CardBlueprint = {
  id: 'water-elemental',
  name: 'Neutral Water Elemental',
  description: 'Transform the tiles this unit passes through into water for 2 turns.',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'neutral_water_elemental',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 6,
  speed: 3,
  range: 1,
  skills: [],
  onPlay({ entity }) {
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
