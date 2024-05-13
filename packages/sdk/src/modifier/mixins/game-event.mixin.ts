import type { MaybePromise } from '@game/shared';
import type { Entity } from '../../entity/entity';
import type { GameEvent, GameEventMap, GameSession } from '../../game-session';
import type { Keyword } from '../../utils/keywords';
import type { EntityModifier, EntityModifierMixin } from '../entity-modifier';
import { modifierEntityDurationMixin } from './duration.mixin';

export const modifierGameEventMixin = <T extends GameEvent>({
  eventName,
  listener,
  keywords = [],
  duration = Infinity,
  once = false
}: {
  eventName: T;
  listener: (
    event: GameEventMap[T],
    ctx: { session: GameSession; attachedTo: Entity; modifier: EntityModifier }
  ) => MaybePromise<void>;
  keywords?: Keyword[];
  duration?: number;
  once?: boolean;
}): EntityModifierMixin => {
  let _listener: any;

  return modifierEntityDurationMixin({
    duration,
    keywords,
    onApplied(session, attachedTo, modifier) {
      _listener = (...args: any[]) => {
        return listener(args as any, { session, attachedTo, modifier });
      };
      if (once) {
        attachedTo.once(eventName, _listener);
      } else {
        session.on(eventName, _listener);
      }
    },
    onRemoved(session, attachedTo, modifier) {
      session.off(eventName, _listener);
    }
  });
};
