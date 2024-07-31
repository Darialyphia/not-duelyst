import type { ClientSession } from '@game/sdk';
import type { GameEvent } from '@game/sdk/src/game-session';

export const createClientSessionRef =
  <T>(getter: (session: ClientSession) => T, events: GameEvent[] = ['*']) =>
  (session: ClientSession) => {
    let _trigger: () => void;
    const cb = () => {
      _trigger();
    };

    const el = customRef((track, trigger) => {
      _trigger = trigger;
      events.forEach(e => {
        session.on(e, cb);
      });
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

    return [
      el,
      () => {
        events.forEach(e => {
          session.off(e, cb);
        });
      }
    ] as const;
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
