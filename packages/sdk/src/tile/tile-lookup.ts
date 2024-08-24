import type { MaybePromise, Nullable } from '@game/shared';
import { keyBy } from 'lodash-es';
import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';
import type { Tile } from './tile';
import { barrier, burn } from '../modifier/modifier-utils';
import { PLAYER_EVENTS } from '../player/player';

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

    async onEnter(session, entity, tile) {
      await entity.player.giveGold(1);
      return tile.destroy();
    },
    onLeave() {
      return;
    }
  },
  // {
  //   id: 'sanctuary',
  //   name: 'Sanctuary',
  //   description: 'Start of turn: give @@Barrier@@ to the minion on this tile.',
  //   spriteId: 'sanctuary',
  //   onCreated(session, entity, tile) {
  //     tile.meta.listener = () => {
  //       if (tile.occupant && !tile.occupant?.isGeneral) {
  //         tile.occupant.addModifier(barrier({ source: tile.occupant.card, duration: 1 }));
  //       }
  //     };
  //     session.on('player:turn_start', tile.meta.listener);
  //   },
  //   onDestroyed(session, entity, tile) {
  //     session.off('player:turn_start', tile.meta.listener);
  //   }
  // },
  // {
  //   id: 'burning_ground',
  //   name: 'Burning Ground',
  //   description: 'End of turn: give @@Burn(1)@@ to the minion on this tile.',
  //   spriteId: 'burning-ground',
  //   onCreated(session, entity, tile) {
  //     tile.meta.listener = () => {
  //       if (tile.occupant) {
  //         tile.occupant.addModifier(burn({ source: tile.occupant.card, duration: 1 }));
  //       }
  //     };
  //     session.on('player:turn_end', tile.meta.listener);
  //   },
  //   onDestroyed(session, entity, tile) {
  //     session.off('player:turn_start', tile.meta.listener);
  //   }
  // },
  {
    id: 'shadow_creep',
    name: 'Shadow Creep',
    description:
      'Deal 3 damage to enemy units standing on it at the end of its owner turn.',
    spriteId: 'creep',
    onCreated(session, entity, tile) {
      if (!tile.player?.isPlayer1) {
        tile.spriteId = 'creep-p2';
      }

      const player = tile.player;
      if (!player) return;
      tile.meta.unsub = player.on(PLAYER_EVENTS.TURN_END, async () => {
        if (!tile.occupant) return;
        if (tile.occupant.player.equals(player)) return;
        await tile.occupant.takeDamage(3, player.general.card, false);
      });
    },
    onDestroyed(session, entity, tile) {
      tile.meta.unsub();
    }
  }
];
export const TILES: Record<TileblueprintId, TileBlueprint> = keyBy(allTiles, 'id');
