import { EntityId, Entity } from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { GameMap, GameMapOptions } from './map/map';
import { Player, PlayerId } from './player/player';
import { PlayerManager } from './player/player-manager';
import { Point3D } from './types';
import { Vec3 } from './utils/vector';

type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<{
    id: EntityId;
    position: Point3D;
    ownerId: PlayerId;
  }>;
  players: { id: PlayerId }[];
};

export type GameContext = {
  map: GameMap;
  entityManager: EntityManager;
  playerManager: PlayerManager;
};

export class Game {
  map: GameMap;
  entityManager = new EntityManager();
  playerManager = new PlayerManager([]);

  constructor(state: SerializedGameState) {
    this.map = new GameMap(state.map);
    state.players.forEach(player => {
      this.playerManager.addPlayer(new Player(player.id));
    });
    this.entityManager.hydrate(
      state.entities.map(
        e =>
          new Entity(
            e.id,
            Vec3.fromPoint3D(e.position),
            this.playerManager.getPlayerById(e.ownerId)!
          )
      )
    );
  }

  private getContext(): GameContext {
    return {
      map: this.map,
      entityManager: this.entityManager,
      playerManager: this.playerManager
    };
  }

  serialize(): SerializedGameState {
    return {
      ...this.entityManager.serialize(),
      map: this.map.serialize(),
      players: this.playerManager.serialize()
    };
  }
}
