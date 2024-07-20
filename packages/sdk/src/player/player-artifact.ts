import type { GameSession } from '../game-session';
import type { CardIndex, PlayerId } from './player';
import { nanoid } from 'nanoid';
import { Interceptable } from '../utils/helpers';
import { Artifact } from '../card/artifact';
import type { Values } from '@game/shared';
import { ENTITY_EVENTS } from '../entity/entity';
import { SafeEventEmitter } from '../utils/safe-event-emitter';

export const ARTIFACT_EVENTS = {
  EQUIPED: 'equiped',

  BEFORE_LOSE_DURABILITY: 'before_lose_durability',
  AFTER_LOSE_DURABILITY: 'after_lose_durability',

  BEFORE_DESTROY: 'before_destroy',
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

export class PlayerArtifact extends SafeEventEmitter<ArtifactEventMap> {
  private cardIndex: CardIndex;

  private playerId: PlayerId;

  durability = this.session.config.ARTIFACT_DURABILITY;

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

  setup() {
    this.player.general.on(
      ENTITY_EVENTS.AFTER_TAKE_DAMAGE,
      this.onGeneralDamageTaken.bind(this)
    );
    this.card.equip(this);
    this.emit(ARTIFACT_EVENTS.EQUIPED, this);
  }

  destroy() {
    this.emit(ARTIFACT_EVENTS.BEFORE_DESTROY, this);
    this.player.general.off(
      ENTITY_EVENTS.AFTER_TAKE_DAMAGE,
      this.onGeneralDamageTaken.bind(this)
    );
    this.player.unequipArtifact(this.id);
    this.emit(ARTIFACT_EVENTS.AFTER_DESTROY, this);
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
