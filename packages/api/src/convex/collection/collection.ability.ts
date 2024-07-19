import { PureAbility } from '@casl/ability';
import { createAbility } from '../utils/ability.utils';
import type { Session } from 'lucia';
import type { CollectionItem } from './collection.entity';

type CollectionItemActions = 'edit';

type Abilities = [CollectionItemActions, 'collection-item' | CollectionItem];

export type CollectionAbility = PureAbility<Abilities>;

export const createCollectionAbility = async (
  session: Session
): Promise<CollectionAbility> => {
  return createAbility<CollectionAbility>(({ can }) => {
    can('edit', 'collection-item', (subject: CollectionItem) => {
      return subject.ownerId === session.user._id;
    });
  });
};
