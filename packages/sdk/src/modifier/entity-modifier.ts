import {
  isDefined,
  type MaybePromise,
  type PartialBy,
  type Prettify
} from '@game/shared';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { Keyword } from '../utils/keywords';
import { nanoid } from 'nanoid';

export type ModifierId = string;

type ModifierBase = {
  id: ModifierId;
  keywords: Keyword[];
  onApplied(
    session: GameSession,
    attachedTo: Entity,
    modifier: EntityModifier
  ): MaybePromise<void>;
  onRemoved(
    session: GameSession,
    attachedTo: Entity,
    modifier: EntityModifier
  ): MaybePromise<void>;
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
      onReapply(
        session: GameSession,
        attachedTo: Entity,
        modifier: EntityModifier
      ): MaybePromise<void>;
    };

export type EntityModifier = Prettify<ModifierBase & StackableMixin & VisibilityMixin>;

export type EntityModifierMixin = Partial<
  Pick<
    EntityModifier & { stackable: false },
    'keywords' | 'onApplied' | 'onRemoved' | 'onReapply'
  >
>;

type ModifierBuilderOptions = PartialBy<
  Pick<EntityModifier, 'id' | 'visible' | 'description' | 'name'>,
  'id'
> &
  Omit<StackableMixin, 'onReapply'> & { mixins: EntityModifierMixin[] };

export const createEntityModifier = ({
  mixins,
  ...options
}: ModifierBuilderOptions): EntityModifier => {
  return {
    ...options,
    id: options.id ?? nanoid(6),
    keywords: [
      ...new Set(
        mixins
          .map(m => m.keywords)
          .flat()
          .filter(isDefined)
      )
    ],
    async onApplied(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onApplied?.(session, attachedTo, this);
      }
    },
    async onRemoved(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onRemoved?.(session, attachedTo, this);
      }
    },
    async onReapply(session, attachedTo) {
      for (const mixin of mixins) {
        mixin.onReapply?.(session, attachedTo, this);
      }
    }
  } as EntityModifier;
};
