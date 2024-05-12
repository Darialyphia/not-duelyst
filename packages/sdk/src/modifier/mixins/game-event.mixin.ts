import type { MaybePromise } from '@game/shared';
import type { Entity } from '../../entity/entity';
import type { GameEvent, GameEventMap, GameSession } from '../../game-session';
import type { Keyword } from '../../utils/keywords';
import type { EntityModifier, EntityModifierMixin } from '../entity-modifier';

export const modifierGameEventMixin = <T extends GameEvent>({
  eventName,
  listener,
  keywords = []
}: {
  eventName: T;
  listener: (
    event: GameEventMap[T],
    ctx: { session: GameSession; attachedTo: Entity; modifier: EntityModifier }
  ) => MaybePromise<void>;
  keywords?: Keyword[];
}): EntityModifierMixin => {
  let _listener: any;

  return {
    keywords,
    onApplied(session, attachedTo, modifier) {
      _listener = (...args: any[]) => {
        return listener(args as any, { session, attachedTo, modifier });
      };
      session.on(eventName, _listener);
    },
    onRemoved(session) {
      session.off(eventName, _listener);
    }
  };
};
