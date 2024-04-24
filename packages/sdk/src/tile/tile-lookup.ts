import type { MaybePromise } from '@game/shared';
import { keyBy } from 'lodash-es';
import type { GameSession } from '../game-session';
import type { Entity } from '../entity/entity';
import type { Tile } from './tile';

export type TileblueprintId = string;

export type TileBlueprint = {
  id: string;
  spriteId: string;
  lightColor?: number;
  onEnter(session: GameSession, entity: Entity, tile: Tile): MaybePromise<void>;
  onLeave(session: GameSession, entity: Entity, tile: Tile): MaybePromise<void>;
};

const allTiles: TileBlueprint[] = [
  {
    id: 'gold-coin',
    spriteId: 'gold-coin',
    lightColor: 0xffff00,
    onEnter(session, entity, tile) {
      entity.player.giveGold(1);
      session.boardSystem.getCellAt(tile.position)!.tile = null;
    },
    onLeave() {
      return;
    }
  }
];
export const TILES: Record<TileblueprintId, TileBlueprint> = keyBy(allTiles, 'id');
