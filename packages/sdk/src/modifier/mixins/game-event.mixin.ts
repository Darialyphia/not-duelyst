import type { MaybePromise } from '@game/shared';
import type { Entity } from '../../entity/entity';
import type { GameEvent, GameEventMap, GameSession } from '../../game-session';
import type { Keyword } from '../../utils/keywords';
import type { EntityModifier, EntityModifierMixin } from '../entity-modifier';
import { modifierCardDurationMixin, modifierEntityDurationMixin } from './duration.mixin';
import type { CardModifier, CardModifierMixin } from '../card-modifier';
import type { Card } from '../../card/card';

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
        session.once(eventName, _listener);
      } else {
        session.on(eventName, _listener);
      }
    },
    onRemoved(session) {
      session.off(eventName, _listener);
    }
  });
};

export const modifierCardGameEventMixin = <T extends GameEvent>({
  eventName,
  listener,
  keywords = [],
  duration = Infinity,
  once = false
}: {
  eventName: T;
  listener: (
    event: GameEventMap[T],
    ctx: { session: GameSession; attachedTo: Card; modifier: CardModifier }
  ) => MaybePromise<void>;
  keywords?: Keyword[];
  duration?: number;
  once?: boolean;
}): CardModifierMixin => {
  let _listener: any;

  return modifierCardDurationMixin({
    duration,
    keywords,
    onApplied(session, attachedTo, modifier) {
      _listener = (...args: any[]) => {
        return listener(args as any, { session, attachedTo, modifier });
      };
      if (once) {
        session.once(eventName, _listener);
      } else {
        session.on(eventName, _listener);
      }
    },
    onRemoved(session) {
      session.off(eventName, _listener);
    }
  });
};
