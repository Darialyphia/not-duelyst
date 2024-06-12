import { noopFXContext, type FXSystem } from './fx-system';
import { GameSession, type SerializedGameState } from './game-session';
import type { SerializedAction } from './action/action';
import deepEqual from 'deep-equal';
import type { AnyObject, MaybePromise } from '@game/shared';
import { ServerSession } from './server-session';
import { ServerRngSystem, type RngSystem } from './rng-system';

export type TutorialStep = {
  action: SerializedAction;
  tooltips: Array<{
    text: string;
    onLeave?: () => MaybePromise<void>;
  }>;
  onEnter?: (session: TutorialSession) => MaybePromise<void>;
  onLeave?: (session: TutorialSession) => MaybePromise<void>;
  meta: AnyObject;
};

export class TutorialSession extends ServerSession {
  static createTutorialSession(
    state: SerializedGameState,
    seed: string,
    steps: TutorialStep[]
  ) {
    return new TutorialSession(
      state,
      new ServerRngSystem(seed),
      noopFXContext,
      {},
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
    },
    public steps: TutorialStep[]
  ) {
    super(initialState, rngSystem, fxSystem, options);

    this.on('game:action', () => {
      if (this.isFinished) return;
      this.goToNextStep();
    });

    this.on('game:ready', () => {
      this.currentStep.onEnter?.(this);
    });
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

  dispatch(action: SerializedAction) {
    if (!this.isFinished && !deepEqual(action, this.currentStep.action)) return;

    this.actionSystem.dispatch(action);
  }
}
