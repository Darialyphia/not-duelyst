import { type FXSystem } from './fx-system';
import {
  type GameEvent,
  type GameFormat,
  type SerializedGameState,
  type StarEvent
} from './game-session';
import type { SerializedAction } from './action/action';
import deepEqual from 'deep-equal';
import type { AnyObject, MaybePromise, Values } from '@game/shared';
import { ClientRngSystem, type RngSystem } from './rng-system';
import { ClientSession } from './client-session';
import type { FACTION_IDS } from './card/card-enums';
import { defaultConfig } from './config';

export type TutorialStep = {
  action: SerializedAction;
  tooltips: Array<{
    text: string;
    onLeave?: () => MaybePromise<void>;
  }>;
  onEnter?: (session: TutorialSession) => MaybePromise<void>;
  onLeave?: (session: TutorialSession) => MaybePromise<void>;
  highlightedResourceAction?: Values<typeof FACTION_IDS> | 'draw' | 'gold';
  highlightedCardIndex?: number;
  meta: AnyObject;
};

export class TutorialSession extends ClientSession {
  static createTutorialSession(
    state: SerializedGameState,
    fxSystem: FXSystem,
    steps: TutorialStep[]
  ) {
    const rngSystem = new ClientRngSystem();
    rngSystem.values = state.rng.values;
    return new TutorialSession(
      state,
      rngSystem,
      fxSystem,
      {
        format: {
          config: defaultConfig,
          cards: {}
        }
      },
      steps
    );
  }

  currentStepIndex = 0;
  isFinished = false;

  protected constructor(
    initialState: SerializedGameState,
    rngSystem: RngSystem,
    fxSystem: FXSystem,
    options: {
      winnerId?: string;
      format: GameFormat;
    },
    public steps: TutorialStep[]
  ) {
    super(initialState, rngSystem, fxSystem, options);

    this.on('game:action', () => {
      if (this.isFinished) return;
      this.goToNextStep();
    });

    this.currentStep.onEnter?.(this);
  }

  get currentStep() {
    return this.steps[this.currentStepIndex];
  }

  private async goToNextStep() {
    await this.currentStep.onLeave?.(this);
    this.currentStepIndex++;
    if (!this.currentStep) {
      this.isFinished = true;
    } else {
      await this.currentStep.onEnter?.(this);
    }
  }

  override dispatch(
    action: SerializedAction,
    meta: { rngValues: number[] } = { rngValues: [] }
  ) {
    if (!this.isFinished && !deepEqual(action, this.currentStep.action)) return;
    super.dispatch(action, meta);
  }
}
