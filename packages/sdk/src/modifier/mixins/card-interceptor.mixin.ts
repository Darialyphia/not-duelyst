import type { ArtifactInterceptor } from '../../card/artifact';
import type { SpellInterceptor } from '../../card/spell';
import type { UnitInterceptor } from '../../card/unit';
import type { inferInterceptor } from '../../utils/helpers';
import type { Keyword } from '../../utils/keywords';
import type { CardModifier } from '../card-modifier';
import { modifierCardDurationMixin } from './duration.mixin';

export const modifierCardInterceptorMixin = <
  T extends keyof UnitInterceptor | keyof SpellInterceptor | keyof ArtifactInterceptor
>({
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
  interceptor: (modifier: CardModifier) => inferInterceptor<UnitInterceptor[T]>;
}) => {
  let _interceptor: any;
  return modifierCardDurationMixin({
    duration,
    keywords,
    tickOn,
    onApplied(session, attachedTo, modifier) {
      _interceptor = interceptor(modifier);
      // @ts-expect-error
      attachedTo.addInterceptor(key, _interceptor, priority);
    },
    onRemoved(session, attachedTo) {
      // @ts-expect-error
      attachedTo.removeInterceptor(key, _interceptor);
    }
  });
};
