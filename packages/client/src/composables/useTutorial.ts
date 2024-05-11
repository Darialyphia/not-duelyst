import type { TutorialSession, TutorialStep } from '@game/sdk';

export const useTutorial = (steps: TutorialStep[]) => {
  const currentTextIndex = ref(0);
  const currentStep = ref<TutorialStep>();

  return {
    currentTextIndex,
    currentStep,
    steps: steps.map(step => ({
      ...step,
      async onEnter(session: TutorialSession) {
        await step.onEnter?.(session);
        currentStep.value = session.currentStep;
      },
      async onLeave(session: TutorialSession) {
        await step.onLeave?.(session);
        currentTextIndex.value = 0;
      }
    }))
  };
};
