import { grantAllCollectionUsecase } from './collection/usecases/grantAllCollection.usecase';
import { grantBasicCardsUsecase } from './collection/usecases/grantBasicCards.usecase';
import { grantAllCollectionToAllPlayersUsecase } from './collection/usecases/grantAllCollectionToAllPlayers.usecase';
import { acknowledgeGrantedCardsUsecase } from './collection/usecases/acknowledgeGrantedCards.usecase';
import { getMyCollectionUsecase } from './collection/usecases/getMyCollection.usecase';
import { updateCollectionItemUsecase } from './collection/usecases/updateCollectionItem.usecase';

export const grantAllCollection = grantAllCollectionUsecase;
export const grantBasicCards = grantBasicCardsUsecase;
export const grantAllCollectionToAllPlayers = grantAllCollectionToAllPlayersUsecase;
export const acknowledgeGranted = acknowledgeGrantedCardsUsecase;
export const myCollection = getMyCollectionUsecase;
export const updateCollectionItem = updateCollectionItemUsecase;
