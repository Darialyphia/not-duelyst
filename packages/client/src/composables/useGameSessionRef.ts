import type { GameSession } from '@game/sdk';

const createGameSessionRef =
  <T>(getter: (session: GameSession) => T) =>
  (session: GameSession) => {
    let _trigger: () => void;

    const el = customRef((track, trigger) => {
      _trigger = trigger;
      session.on('*', trigger);
      return {
        get() {
          track();
          return getter(session);
        },
        set() {
          return;
        }
      };
    });

    return [el, () => session.off('*', _trigger)] as const;
  };

export const useGameSelector = <T>(getter: (session: GameSession) => T) => {
  const { session } = useGame();
  const [val, unsub] = createGameSessionRef(getter)(session);

  onUnmounted(unsub);

  return val;
};
