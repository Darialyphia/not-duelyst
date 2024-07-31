import type { ClientSession } from '@game/sdk';

export const createClientSessionRef =
  <T>(getter: (session: ClientSession) => T) =>
  (session: ClientSession) => {
    let _trigger: () => void;

    const el = customRef((track, trigger) => {
      _trigger = trigger;
      session.on('*', _trigger);
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

export const useGameSelector = <T>(
  getter: (session: ClientSession) => T,
  ctx?: GameContext
) => {
  const { session } = ctx ?? useGame();
  const [val, unsub] = createClientSessionRef(getter)(session);

  onUnmounted(() => {
    unsub();
  });

  return val;
};
