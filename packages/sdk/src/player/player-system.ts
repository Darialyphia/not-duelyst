import { CARD_EVENTS } from '../card/card';
import { GameSession } from '../game-session';
import { type PlayerId, Player, type SerializedPlayer, PLAYER_EVENTS } from './player';

export class PlayerSystem {
  private playerMap = new Map<PlayerId, Player>();
  private activePlayerId!: PlayerId;

  constructor(private session: GameSession) {}

  setup(players: [SerializedPlayer, SerializedPlayer]) {
    return Promise.all(
      players
        .map(player => new Player(this.session, player))
        .map(async player => {
          await this.addPlayer(player);
          if (player.isPlayer1) {
            this.activePlayerId = player.id;
          }
        })
    );
  }

  get activePlayer() {
    return this.getPlayerById(this.activePlayerId)!;
  }

  setupListeners(player: Player) {
    Object.values(PLAYER_EVENTS).forEach(eventName => {
      player.on(eventName, async event => {
        await this.session.emitAsync(`player:${eventName}`, event as any);
      });
    });

    Object.values(CARD_EVENTS).forEach(eventName => {
      player.cards.forEach(card => {
        card.on(eventName, async event => {
          await this.session.emitAsync(`card:${eventName}`, event as any);
        });
      });
    });
  }

  getList() {
    return [...this.playerMap.values()];
  }

  getPlayerById(id: PlayerId) {
    return this.playerMap.get(id);
  }

  getOpponent(id: PlayerId) {
    return this.getList().find(p => p.id !== id)!;
  }

  async addPlayer(player: Player) {
    this.playerMap.set(player.id, player);
    await player.setup();
    this.setupListeners(player);
  }

  removePlayer(playerId: PlayerId) {
    this.playerMap.delete(playerId);
  }

  async switchActivePlayer() {
    await this.activePlayer?.endTun();
    this.activePlayerId = this.getList().find(
      player => player.id !== this.activePlayerId
    )!.id;
    await this.activePlayer.startTurn();
  }

  serialize() {
    return {
      players: this.getList().map(player => player.serialize())
    };
  }
}
