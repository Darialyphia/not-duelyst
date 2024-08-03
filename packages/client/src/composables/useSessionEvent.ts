import type { GameEvent, GameEventPayload } from '@game/sdk';

export const useSessionEvent = <T extends GameEvent>(
  eventName: T,
  cb: (args: GameEventPayload<T>) => void
) => {
  const { session } = useGame();

  const unsub = session.on(eventName, (...e) => {
    return cb(e);
  });

  onUnmounted(unsub);
};
