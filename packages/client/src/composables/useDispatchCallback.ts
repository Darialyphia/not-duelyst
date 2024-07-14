import type { GameEvent, GameEventMap, StarEvent } from '@game/sdk/src/game-session';
import type { MaybePromise } from '@game/shared';

export const useDispatchCallback = <T extends GameEvent>(
  name: T,
  preCb: (
    event: GameEventMap[T][0],
    index: number,
    otherEvents: StarEvent[]
  ) => MaybePromise<void>,
  postCb: (
    event: GameEventMap[T][0],
    index: number,
    otherEvents: StarEvent[]
  ) => MaybePromise<void> = () => void 0
) => {
  const { session } = useGame();

  const unsub = session.onAsyncDispatch(name, {
    pre(event, index, otherEvents) {
      // @FIXME must be a type definition error somewhere
      return preCb(event.event as unknown as GameEventMap[T][0], index, otherEvents);
    },
    post(event, index, otherEvents) {
      // @FIXME
      return postCb(event.event as unknown as GameEventMap[T][0], index, otherEvents);
    }
  });

  onUnmounted(unsub);
};
