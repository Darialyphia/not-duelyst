import type { Nullable } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import type { CollectionItem } from './collection.entity';

export type CollectionItemDto = {
  _id: Id<'collectionItems'>;
  cardId: string;
  grantedAt: Nullable<number>;
};

export const toCollectionItemDto = (
  collecttionItem: CollectionItem
): CollectionItemDto => {
  return {
    _id: collecttionItem._id,
    cardId: collecttionItem.itemId,
    grantedAt: collecttionItem.grantedAt
  };
};
