import { EntityId, Entity } from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { GameMap, GameMapOptions } from './map/map';
import { Player, PlayerId } from './player/player';
import { PlayerManager } from './player/player-manager';
import { Point3D } from './types';
import { Vec3 } from './utils/vector';

type SerializedGameState = {
  map: GameMapOptions;
  nextEntityId: number;
  entities: Array<{
    id: EntityId;
    position: Point3D;
    ownerId: PlayerId;
  }>;
  players: { id: PlayerId }[];
};

class Game {
  map: GameMap;
  entityManager: EntityManager;
  playerManager: PlayerManager;

  constructor(state: SerializedGameState) {
    this.map = new GameMap(state.map);
    this.playerManager = new PlayerManager(
      state.players.map(player => new Player(player.id))
    );
    this.entityManager = new EntityManager({
      nextEntityId: state.nextEntityId,
      entities: state.entities.map(
        e =>
          new Entity(
            e.id,
            Vec3.fromPoint3D(e.position),
            this.playerManager.getPlayerById(e.ownerId)!
          )
      )
    });
  }

  serialize(): SerializedGameState {
    return {
      ...this.entityManager.serialize(),
      map: this.map.serialize(),
      players: this.playerManager.serialize()
    };
  }
}
