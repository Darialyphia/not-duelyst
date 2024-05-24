import type { Keyword } from '../../utils/keywords';
import type { CardModifier, CardModifierMixin } from '../card-modifier';
import type { EntityModifier, EntityModifierMixin } from '../entity-modifier';

export const modifierEntityDurationMixin = ({
  duration,
  tickOn = 'end',
  onApplied,
  onRemoved,
  keywords = []
}: {
  duration: number;
  tickOn?: 'start' | 'end';
  onApplied: EntityModifier['onApplied'];
  onRemoved: EntityModifier['onRemoved'];
  keywords?: Keyword[];
}): EntityModifierMixin => {
  let _duration = duration;
  return {
    keywords,
    onApplied(session, attachedTo, modifier) {
      const eventName = tickOn === 'end' ? 'turn_end' : 'turn_start';
      const listener = () => {
        _duration--;
        if (_duration === 0) {
          attachedTo.player.off(eventName, listener);
          attachedTo.removeModifier(modifier.id);
        }
      };
      attachedTo.player.on(eventName, listener);
      return onApplied(session, attachedTo, modifier);
    },
    onRemoved(session, attachedTo, modifier) {
      return onRemoved(session, attachedTo, modifier);
    },
    onReapply() {
      _duration = duration;
    }
  };
};

export const modifierCardDurationMixin = ({
  duration,
  tickOn = 'end',
  onApplied,
  onRemoved,
  keywords = []
}: {
  duration: number;
  tickOn?: 'start' | 'end';
  onApplied: CardModifier['onApplied'];
  onRemoved: CardModifier['onRemoved'];
  keywords?: Keyword[];
}): CardModifierMixin => {
  let _duration = duration;

  return {
    keywords,
    onApplied(session, attachedTo, modifier) {
      const eventName = tickOn === 'end' ? 'turn_end' : 'turn_start';
      const listener = () => {
        _duration--;
        if (_duration === 0) {
          attachedTo.player.off(eventName, listener);
          attachedTo.removeModifier(modifier.id);
        }
      };
      attachedTo.player.on(eventName, listener);
      return onApplied(session, attachedTo, modifier);
    },
    onRemoved(session, attachedTo, modifier) {
      return onRemoved(session, attachedTo, modifier);
    }
  };
};
