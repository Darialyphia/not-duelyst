import {
  type GameFormat,
  type SerializedGameState,
  type SessionLogger
} from './game-session';
import type { SerializedAction } from './action/action';
import deepEqual from 'deep-equal';
import type { AnyObject, MaybePromise, Values } from '@game/shared';
import { ClientRngSystem, type RngSystem } from './rng-system';
import { ClientSession } from './client-session';
import type { FACTION_IDS } from './card/card-enums';
import { defaultConfig } from './config';
import { ClientFxSystem } from './fx-system';
import { tutorialMap } from './board/maps';

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

const tutorialLogger: SessionLogger = () => void 0;

export class TutorialSession extends ClientSession {
  static createTutorialSession(state: SerializedGameState, steps: TutorialStep[]) {
    const rngSystem = new ClientRngSystem();
    rngSystem.values = state.rng.values;
    return new TutorialSession(
      state,
      rngSystem,
      {
        format: {
          config: defaultConfig,
          map: tutorialMap,
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
    options: {
      winnerId?: string;
      format: GameFormat;
    },
    public steps: TutorialStep[]
  ) {
    super(initialState, rngSystem, new ClientFxSystem(), tutorialLogger, options);

    this.on('game:action', async () => {
      if (this.isFinished) return;
      await this.goToNextStep();
    });

    void this.currentStep.onEnter?.(this);
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

  override async dispatch(
    action: SerializedAction,
    meta: { rngValues: number[] } = { rngValues: [] }
  ) {
    if (!this.isFinished && !deepEqual(action, this.currentStep.action)) return;
    return super.dispatch(action, meta);
  }
}
