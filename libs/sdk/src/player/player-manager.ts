import { Player, PlayerId } from './player';

export class PlayerManager {
  private playerMap = new Map<PlayerId, Player>();
  private players: Player[] = [];

  constructor(players: { id: PlayerId }[]) {
    players
      .map(p => new Player(p.id))
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
