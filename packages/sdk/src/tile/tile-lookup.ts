import type { MaybePromise, Nullable } from '@game/shared';
import { keyBy } from 'lodash-es';
import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';
import type { Tile } from './tile';
import { barrier, burn } from '../modifier/modifier-utils';

export type TileblueprintId = string;

export type TileBlueprint = {
  id: string;
  name: string;
  description: string;
  spriteId: string;
  onCreated?: (session: GameSession, entity: Nullable<Entity>, tile: Tile) => void;
  onDestroyed?: (session: GameSession, entity: Nullable<Entity>, tile: Tile) => void;
  onEnter?: (session: GameSession, entity: Entity, tile: Tile) => MaybePromise<void>;
  onLeave?: (session: GameSession, entity: Entity, tile: Tile) => MaybePromise<void>;
};

const allTiles: TileBlueprint[] = [
  {
    id: 'gold_coin',
    name: 'Gold coin',
    description: 'Move a unit on this tile to pick up the coin and gain 1 gold.',
    spriteId: 'gold-coin',

    onEnter(session, entity, tile) {
      entity.player.giveGold(1);
      return tile.destroy();
    },
    onLeave() {
      return;
    }
  },
  {
    id: 'sanctuary',
    name: 'Sanctuary',
    description: 'Start of turn: give @@Barrier@@ to the minion on this tile.',
    spriteId: 'sanctuary',
    onCreated(session, entity, tile) {
      tile.meta.listener = () => {
        if (tile.occupant && !tile.occupant?.isGeneral) {
          tile.occupant.addModifier(barrier({ source: tile.occupant.card, duration: 1 }));
        }
      };
      session.on('player:turn_start', tile.meta.listener);
    },
    onDestroyed(session, entity, tile) {
      session.off('player:turn_start', tile.meta.listener);
    }
  },
  {
    id: 'burning_ground',
    name: 'Burning Ground',
    description: 'End of turn: give @@Burn(1)@@ to the minion on this tile.',
    spriteId: 'burning-ground',
    onCreated(session, entity, tile) {
      tile.meta.listener = () => {
        if (tile.occupant) {
          tile.occupant.addModifier(burn({ source: tile.occupant.card, duration: 1 }));
        }
      };
      session.on('player:turn_end', tile.meta.listener);
    },
    onDestroyed(session, entity, tile) {
      session.off('player:turn_start', tile.meta.listener);
    }
  }
];
export const TILES: Record<TileblueprintId, TileBlueprint> = keyBy(allTiles, 'id');
