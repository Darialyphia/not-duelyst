import { GameContext } from '../game';
import { Loadout, Player, PlayerId } from './player';

export class PlayerManager {
  private playerMap = new Map<PlayerId, Player>();

  constructor(private ctx: GameContext) {}

  setup(players: { id: PlayerId; loadout: Loadout }[]) {
    players
      .map(p => new Player(p.id, p.loadout))
      .forEach(player => {
        this.addPlayer(player);
      });
  }

  getList() {
    return [...this.playerMap.values()];
  }

  getPlayerById(id: PlayerId) {
    return this.playerMap.get(id);
  }

  getActivePlayer() {
    return this.getPlayerById(this.ctx.atb.activeEntity.playerId)!;
  }

  addPlayer(player: Player) {
    this.playerMap.set(player.id, player);
  }

  removePlayer(playerId: PlayerId) {
    this.playerMap.delete(playerId);
  }

  serialize() {
    return this.getList().map(player => player.serialize());
  }
}
