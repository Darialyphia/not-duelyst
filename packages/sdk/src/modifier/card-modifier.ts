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
  onApplied(session: GameSession, card: Card, modifier: CardModifier): MaybePromise<void>;
  onRemoved(
    session: GameSession,
    attachedTo: Card,
    modifier: CardModifier
  ): MaybePromise<void>;
  keywords: Keyword[];
};

export type CardModifier = Prettify<ModifierBase>;

export type CardModifierMixin = Partial<
  Pick<CardModifier, 'onApplied' | 'onRemoved' | 'keywords'>
>;

type ModifierBuilderOptions = PartialBy<Pick<CardModifier, 'id'>, 'id'> & {
  mixins: CardModifierMixin[];
};

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
    async onApplied(session, card) {
      for (const mixin of mixins) {
        mixin.onApplied?.(session, card, this);
      }
    },
    async onRemoved(session, card) {
      for (const mixin of mixins) {
        mixin.onRemoved?.(session, card, this);
      }
    }
  } as CardModifier;
};
