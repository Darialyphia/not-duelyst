import type { CardInterceptor } from '../../card/card';
import type { inferInterceptor } from '../../utils/helpers';
import type { Keyword } from '../../utils/keywords';
import type { CardModifier } from '../card-modifier';
import { modifierCardDurationMixin } from './duration.mixin';

export const modifierCardInterceptorMixin = <T extends keyof CardInterceptor>({
  key,
  duration = Infinity,
  interceptor,
  tickOn,
  keywords,
  priority
}: {
  key: T;
  keywords: Keyword[];
  duration?: number;
  priority?: number;
  tickOn?: Parameters<typeof modifierCardDurationMixin>[0]['tickOn'];
  interceptor: (modifier: CardModifier) => inferInterceptor<CardInterceptor[T]>;
}) => {
  let _interceptor: any;
  return modifierCardDurationMixin({
    duration,
    keywords,
    tickOn,
    onApplied(session, attachedTo, modifier) {
      _interceptor = interceptor(modifier);
      attachedTo.addInterceptor(key, _interceptor, priority);
    },
    onRemoved(session, attachedTo) {
      attachedTo.removeInterceptor(key, _interceptor);
    }
  });
};
