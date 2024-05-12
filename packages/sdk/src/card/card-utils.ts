import type { Entity } from '../entity/entity';
import { createCardModifier } from '../modifier/card-modifier';
import { createEntityModifier } from '../modifier/entity-modifier';
import { modifierCardInterceptorMixin } from '../modifier/mixins/card-interceptor.mixin';
import { modifierEntityInterceptorMixin } from '../modifier/mixins/entity-interceptor.mixin';
import { KEYWORDS } from '../utils/keywords';

export const vigilant = (entity: Entity, duration?: number) => {
  entity.addModifier(
    createEntityModifier({
      visible: false,
      stackable: false,
      mixins: [
        modifierEntityInterceptorMixin({
          key: 'maxRetalitions',
          interceptor: () => () => Infinity,
          duration,
          keywords: [KEYWORDS.VIGILANT]
        })
      ]
    })
  );
};

export const vulnerable = (entity: Entity, duration?: number) => {
  entity.addModifier(
    createEntityModifier({
      visible: false,
      stackable: false,
      mixins: [
        modifierEntityInterceptorMixin({
          key: 'damageTaken',
          interceptor: () => amount => amount + 1,
          tickOn: 'start',
          duration,
          keywords: [KEYWORDS.VULNERABLE]
        })
      ]
    })
  );
};

export const rush = () => {
  return createCardModifier({
    mixins: [
      modifierCardInterceptorMixin({
        key: 'shouldExhaustOnPlay',
        interceptor: () => () => false,
        keywords: [KEYWORDS.RUSH]
      })
    ]
  });
};
