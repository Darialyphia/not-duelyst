import { isDefined, type PartialBy, type Prettify } from '@game/shared';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { Keyword } from '../utils/keywords';
import { nanoid } from 'nanoid';
import type { Card } from '../card/card';

export type ModifierId = string;

type ModifierBase = {
  id: ModifierId;
  source: Card;
  keywords: Keyword[];
  onApplied(session: GameSession, attachedTo: Entity, modifier: EntityModifier): void;
  onRemoved(session: GameSession, attachedTo: Entity, modifier: EntityModifier): void;
};

type VisibilityMixin =
  | { visible: true; name: string; description: string }
  | { visible: false; name?: never; description?: never };

type StackableMixin =
  | {
      stackable: true;
      stacks: number;
    }
  | {
      stackable: false;
      stacks?: never;
      onReapply(session: GameSession, attachedTo: Entity, modifier: EntityModifier): void;
    };

export type EntityModifier = Prettify<ModifierBase & StackableMixin & VisibilityMixin>;

export type EntityModifierMixin = Partial<
  Pick<
    EntityModifier & { stackable: false },
    'keywords' | 'onApplied' | 'onRemoved' | 'onReapply'
  >
>;

type ModifierBuilderOptions = PartialBy<
  Pick<EntityModifier, 'id' | 'visible' | 'description' | 'name' | 'source'>,
  'id'
> &
  Omit<StackableMixin, 'onReapply'> & { mixins: EntityModifierMixin[] };

export const createEntityModifier = ({
  mixins,
  ...options
}: ModifierBuilderOptions): EntityModifier => {
  return {
    ...options,
    stacks: options.stackable ? (options.stacks ?? 1) : undefined,
    id: options.id ?? nanoid(6),
    keywords: [
      ...new Set(
        mixins
          .map(m => m.keywords)
          .flat()
          .filter(isDefined)
      )
    ],
    onApplied(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onApplied?.(session, attachedTo, this);
      }
    },
    onRemoved(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onRemoved?.(session, attachedTo, this);
      }
    },
    onReapply(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onReapply?.(session, attachedTo, this);
      }
    }
  } as EntityModifier;
};
