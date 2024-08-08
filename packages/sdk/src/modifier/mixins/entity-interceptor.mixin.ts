import type { EntityInterceptor } from '../../entity/entity';
import type { GameSession } from '../../game-session';
import type { inferInterceptor } from '../../utils/helpers';
import type { Keyword } from '../../utils/keywords';
import type { EntityModifier } from '../entity-modifier';
import { modifierEntityDurationMixin } from './duration.mixin';

export const modifierEntityInterceptorMixin = <T extends keyof EntityInterceptor>({
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
  tickOn?: Parameters<typeof modifierEntityDurationMixin>[0]['tickOn'];
  interceptor: (
    modifier: EntityModifier,
    session: GameSession
  ) => inferInterceptor<EntityInterceptor[T]>;
}) => {
  let _interceptor: any;
  return modifierEntityDurationMixin({
    duration,
    keywords,
    tickOn,
    onApplied(session, attachedTo, modifier) {
      _interceptor = interceptor(modifier, session);
      attachedTo.addInterceptor(key, _interceptor, priority);
    },
    onRemoved(session, attachedTo) {
      attachedTo.removeInterceptor(key, _interceptor);
    }
  });
};
