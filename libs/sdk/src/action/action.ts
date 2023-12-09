import { JSONValue } from '@hc/shared';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { SerializedAction } from './action-deserializer';
import { EntityId } from '../entity/entity';
import { Point3D } from '../types';

export type FXContext = {
  moveEntity(entityId: EntityId, to: Point3D, duration: number): Promise<void>;
  playAnimationOnce(
    entityId: EntityId,
    animationName: string,
    opts?: {
      animationNameFallback?: string;
      framePercentage?: number;
    }
  ): Promise<void>;
  playAnimationUntil(
    entityId: EntityId,
    animationName: string,
    opts?: {
      animationNameFallback?: string;
    }
  ): () => void;
};

export abstract class GameAction<TPayload extends JSONValue> implements Serializable {
  abstract readonly name: string;
  // readonly isSideEffect: boolean;

  constructor(
    public payload: TPayload,
    protected ctx: GameSession
  ) {
    // this.isSideEffect = this.ctx.isExecutingAction;
  }

  protected abstract impl(): void;

  protected abstract fxImpl(): Promise<void>;

  async execute() {
    if (!this.ctx.isAuthoritative) {
      if (!this.ctx.fxContext) {
        console.warn(
          'FXContext not provided on the game session. Skipping FX implementation.'
        );
      }
      await this.fxImpl();
    }

    this.ctx.history.add(this);
    this.impl();
    this.ctx.emitter.emit('game:event', this.serialize() as unknown as SerializedAction); // smh
  }

  serialize() {
    return { type: this.name, payload: this.payload };
  }
}
