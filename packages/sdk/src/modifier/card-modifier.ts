import {
  isDefined,
  type MaybePromise,
  type PartialBy,
  type Prettify
} from '@game/shared';
import type { GameSession } from '../game-session';
import { nanoid } from 'nanoid';
import type { Card } from '../card/card';
import type { Keyword } from '../utils/keywords';

export type ModifierId = string;

type ModifierBase = {
  id: ModifierId;
  onApplied(session: GameSession, card: Card, modifier: CardModifier): void;
  onRemoved(session: GameSession, attachedTo: Card, modifier: CardModifier): void;
  keywords: Keyword[];
};

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
        attachedTo: Card,
        modifier: CardModifier
      ): MaybePromise<void>;
    };

export type CardModifier = Prettify<ModifierBase & StackableMixin>;

export type CardModifierMixin = Partial<
  Pick<CardModifier & { stackable: false }, 'onApplied' | 'onRemoved' | 'keywords'>
>;

type ModifierBuilderOptions = PartialBy<Pick<CardModifier, 'id'>, 'id'> & {
  mixins: CardModifierMixin[];
} & Omit<StackableMixin, 'onReapply'> & { mixins: CardModifierMixin[] };

export const createCardModifier = ({
  mixins,
  ...options
}: ModifierBuilderOptions): CardModifier => {
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
    onApplied(session, card) {
      for (const mixin of mixins) {
        mixin.onApplied?.(session, card, this);
      }
    },
    onRemoved(session, card) {
      for (const mixin of mixins) {
        mixin.onRemoved?.(session, card, this);
      }
    }
  } as CardModifier;
};
