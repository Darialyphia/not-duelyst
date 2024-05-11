import type { FXSystem } from './fx-system';
import { GameSession, type SerializedGameState } from './game-session';
import type { SerializedAction } from './action/action';
import deepEqual from 'deep-equal';
import type { AnyObject, MaybePromise } from '@game/shared';

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

export class TutorialSession extends GameSession {
  static create(
    state: SerializedGameState,
    seed: string,
    fxSystem: FXSystem,
    steps: TutorialStep[]
  ) {
    return new TutorialSession(state, { seed, isAuthoritative: false, fxSystem }, steps);
  }

  currentStepIndex = 0;

  protected constructor(
    initialState: SerializedGameState,
    options: {
      isAuthoritative: boolean;
      seed: string;
      fxSystem: FXSystem;
    },
    private steps: TutorialStep[]
  ) {
    super(initialState, options);

    this.on('game:action', () => {
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
    await this.currentStep.onEnter?.(this);
  }

  dispatch(action: SerializedAction) {
    console.log(action, this.currentStep.action);
    if (!deepEqual(action, this.currentStep.action)) return;

    this.actionSystem.dispatch(action);
  }
}
