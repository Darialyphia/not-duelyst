import { CARD_EVENTS } from '../card/card';
import { GameSession } from '../game-session';
import { type PlayerId, Player, type SerializedPlayer, PLAYER_EVENTS } from './player';

export class PlayerSystem {
  private playerMap = new Map<PlayerId, Player>();
  private activePlayerId!: PlayerId;

  constructor(private session: GameSession) {}

  setup(players: [SerializedPlayer, SerializedPlayer]) {
    players
      .map(player => new Player(this.session, player))
      .forEach(player => {
        this.addPlayer(player);
        if (player.isPlayer1) {
          this.activePlayerId = player.id;
        }
      });
  }

  get activePlayer() {
    return this.getPlayerById(this.activePlayerId)!;
  }

  setupListeners(player: Player) {
    Object.values(PLAYER_EVENTS).forEach(eventName => {
      player.on(eventName, event => {
        this.session.emit(`player:${eventName}`, event);
      });
    });

    Object.values(CARD_EVENTS).forEach(eventName => {
      player.cards.forEach(card => {
        card.on(eventName, event => {
          this.session.emit(`card:${eventName}`, event as any);
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

  addPlayer(player: Player) {
    this.playerMap.set(player.id, player);
    player.setup();
    this.setupListeners(player);
  }

  removePlayer(playerId: PlayerId) {
    this.playerMap.delete(playerId);
  }

  switchActivePlayer() {
    this.activePlayer?.endTun();
    this.activePlayerId = this.getList().find(
      player => player.id !== this.activePlayerId
    )!.id;
    this.activePlayer.startTurn();
  }

  serialize() {
    return {
      players: this.getList().map(player => player.serialize())
    };
  }
}
