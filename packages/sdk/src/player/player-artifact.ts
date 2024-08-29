import type { GameSession } from '../game-session';
import type { CardIndex, PlayerId } from './player';
import { nanoid } from 'nanoid';
import { Interceptable } from '../utils/helpers';
import { Artifact } from '../card/artifact';
import type { Values } from '@game/shared';
import { ENTITY_EVENTS } from '../entity/entity';
import { TypedEventEmitter } from '../utils/typed-emitter';

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
  card: Artifact;
  playerId: PlayerId;
};

export type ArtifactInterceptor = PlayerArtifact['interceptors'];

export type PlayerArtifactId = string;

export class PlayerArtifact extends TypedEventEmitter<ArtifactEventMap> {
  readonly card: Artifact;

  private playerId: PlayerId;

  durability: number;

  id: PlayerArtifactId;

  private interceptors = {
    shouldLoseDurabilityOnGeneralDamage: new Interceptable<boolean, PlayerArtifact>()
  };

  constructor(
    protected session: GameSession,
    options: PLayerArtifactOptions
  ) {
    super();
    this.durability = this.session.config.ARTIFACT_DURABILITY;
    this.id = nanoid(6);
    this.card = options.card;
    this.playerId = options.playerId;
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get shouldLoseDurabilityOnGeneralDamage(): boolean {
    return this.interceptors.shouldLoseDurabilityOnGeneralDamage.getValue(true, this);
  }

  private async onGeneralDamageTaken({ amount }: { amount: number }) {
    if (!amount) return;
    if (this.shouldLoseDurabilityOnGeneralDamage) {
      await this.loseDurability();
    }
  }

  equals(artifact: PlayerArtifact) {
    return this.id === artifact.id;
  }

  async setup(choice: number) {
    this.player.general.on(
      ENTITY_EVENTS.AFTER_TAKE_DAMAGE,
      this.onGeneralDamageTaken.bind(this)
    );
    await this.card.equip(this, choice);
    await this.emitAsync(ARTIFACT_EVENTS.EQUIPED, this);
  }

  async destroy() {
    await this.emitAsync(ARTIFACT_EVENTS.BEFORE_DESTROY, this);
    this.player.general.off(
      ENTITY_EVENTS.AFTER_TAKE_DAMAGE,
      this.onGeneralDamageTaken.bind(this)
    );
    this.player.unequipArtifact(this.id);
    await this.emitAsync(ARTIFACT_EVENTS.AFTER_DESTROY, this);
  }

  async loseDurability() {
    await this.emitAsync(ARTIFACT_EVENTS.BEFORE_LOSE_DURABILITY, this);
    this.durability--;
    await this.emitAsync(ARTIFACT_EVENTS.AFTER_LOSE_DURABILITY, this);
    if (this.durability === 0) {
      await this.destroy();
    }
  }
}
