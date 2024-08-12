import type { FXEventMap } from '@game/sdk';

export const useVFX = <T extends keyof FXEventMap>(
  eventName: T,
  cb: (...args: FXEventMap[T]) => Promise<void>
) => {
  const { session } = useGame();

  const unsub = session.fxSystem.on(eventName, cb);

  onUnmounted(unsub);
};
