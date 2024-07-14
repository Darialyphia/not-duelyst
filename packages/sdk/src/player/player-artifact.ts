import EventEmitter from 'eventemitter3';
import { config } from '../config';
import type { GameSession } from '../game-session';
import type { CardIndex, PlayerId } from './player';
import { nanoid } from 'nanoid';
import { Interceptable } from '../utils/helpers';
import { Artifact } from '../card/artifact';
import type { Values } from '@game/shared';

export const ARTIFACT_EVENTS = {
  EQUIPED: 'equiped',

  BEFORE_LOSE_DURABILITY: 'before_lose_durability',
  AFTER_LOSE_DURABILITY: 'after_lose_durability',

  BEFORE_DESTROY: 'destroy_destroy',
  AFTER_DESTROY: 'after_destroy'
} as const;

export type ArtifactEvent = Values<typeof ARTIFACT_EVENTS>;

export type ArtifactEventMap = {
  [ARTIFACT_EVENTS.EQUIPED]: [artifact: PlayerArtifact];

  [ARTIFACT_EVENTS.BEFORE_LOSE_DURABILITY]: [artifact: PlayerArtifact];
  [ARTIFACT_EVENTS.AFTER_LOSE_DURABILITY]: [artifact: PlayerArtifact];

  [ARTIFACT_EVENTS.BEFORE_DESTROY]: [artifact: PlayerArtifact];
  [ARTIFACT_EVENTS.AFTER_DESTROY]: [artifact: PlayerArtifact];
};

export type PLayerArtifactOptions = {
  cardIndex: CardIndex;
  playerId: PlayerId;
};

export type ArtifactInterceptor = PlayerArtifact['interceptors'];

export type PlayerArtifactId = string;

export class PlayerArtifact extends EventEmitter<ArtifactEventMap> {
  private cardIndex: CardIndex;

  private playerId: PlayerId;

  durability = config.ARTIFACT_DURABILITY;

  id: PlayerArtifactId;

  private interceptors = {
    shouldLoseDurabilityOnGeneralDamage: new Interceptable<boolean, PlayerArtifact>()
  };

  constructor(
    protected session: GameSession,
    options: PLayerArtifactOptions
  ) {
    super();
    this.id = nanoid(6);
    this.cardIndex = options.cardIndex;
    this.playerId = options.playerId;

    this.player.general.on('after_take_damage', this.onGeneralDamageTaken.bind(this));
  }

  get card() {
    const card = this.player.cards[this.cardIndex];
    if (!(card instanceof Artifact)) {
      throw new Error('Entity card is not a Unit');
    }

    return card;
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get shouldLoseDurabilityOnGeneralDamage(): boolean {
    return this.interceptors.shouldLoseDurabilityOnGeneralDamage.getValue(true, this);
  }

  private onGeneralDamageTaken({ amount }: { amount: number }) {
    if (!amount) return;
    if (this.shouldLoseDurabilityOnGeneralDamage) {
      this.loseDurability();
    }
  }

  equals(artifact: PlayerArtifact) {
    return this.id === artifact.id;
  }

  destroy() {
    this.emit('destroy_destroy', this);
    this.player.general.off('after_take_damage', this.onGeneralDamageTaken.bind(this));
    this.player.unequipArtifact(this.id);
    this.emit('after_destroy', this);
  }

  loseDurability() {
    this.emit(ARTIFACT_EVENTS.BEFORE_LOSE_DURABILITY, this);
    this.durability--;
    this.emit(ARTIFACT_EVENTS.AFTER_LOSE_DURABILITY, this);
    if (this.durability === 0) {
      this.destroy();
    }
  }
}
