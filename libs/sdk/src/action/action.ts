import { JSONObject } from '@hc/shared';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { EntityId } from '../entity/entity';
import { Point3D } from '../types';

export type FXContext = {
  displayText(
    text: string,
    entityId: EntityId,
    options: {
      color: string | string[] | number | number[];
      path: { x?: number; y?: number; scale?: number; alpha?: number }[];
      duration: number;
    }
  ): Promise<void>;
  addChildSprite(
    spriteId: string,
    entityId: EntityId,
    options?: {
      animationName?: string;
      offset?: { x: number; y: number };
      waitUntilAnimationDone?: boolean;
      scale?: number;
    }
  ): Promise<void>;
  playSoundOnce(
    soundId: string,

    options?: { fallback?: string; percentage?: number; slice?: [number, number] }
  ): Promise<void>;
  playSoundUntil(
    soundId: string,
    options?: { slice?: [number, number]; fallback?: string }
  ): () => void;
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
  shakeEntity(
    entityId: EntityId,
    opts?: {
      count?: number;
      axis?: 'x' | 'y' | 'both';
      amount?: number;
      totalDuration?: number;
    }
  ): Promise<void>;
  moveEntity(entityId: EntityId, to: Point3D, duration: number): Promise<void>;
  fadeOutEntity(entityId: EntityId, duration: number): Promise<void>;
};

export abstract class GameAction<TPayload extends JSONObject> implements Serializable {
  abstract readonly name: string;
  // readonly isSideEffect: boolean;

  constructor(
    public payload: TPayload,
    protected ctx: GameSession
  ) {}

  protected abstract impl(): void;

  protected abstract fxImpl(): Promise<void>;

  private get isSideEffect() {
    return !this.ctx.isAuthoritative && !this.payload.isFromAuthoritativeSession;
  }

  async execute() {
    // discards client side actions generated as side effects of other actions executed client side
    if (this.isSideEffect) {
      return;
    }

    // game is over, can't execute further actions
    if (this.ctx.winner) {
      return;
    }

    if (!this.ctx.isAuthoritative) {
      if (!this.ctx.fxContext) {
        console.warn(
          'FXContext not provided on the game session. Skipping FX implementation.'
        );
      } else {
        await this.fxImpl();
      }
    }

    this.ctx.history.add(this);
    this.impl();
    this.ctx.emitter.emit('game:action', this); // smh
  }

  serialize() {
    return {
      type: this.name,
      payload: { ...this.payload, isFromAuthoritativeSession: this.ctx.isAuthoritative }
    };
  }
}
