import type { Id } from '../_generated/dataModel';
import type { CollectionItem } from './collection.entity';

export type CollectionItemDto = {
  _id: Id<'collectionItems'>;
  cardId: string;
};

export const toCollectionItemDto = (
  collecttionItem: CollectionItem
): CollectionItemDto => {
  return {
    _id: collecttionItem._id,
    cardId: collecttionItem.itemId
  };
};
