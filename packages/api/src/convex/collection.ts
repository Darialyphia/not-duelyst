import { grantAllCollectionUsecase } from './collection/usecases/grant-all-collection.usecase';
import { grantBasicCardsUsecase } from './collection/usecases/grant-basic-card.usecase';
import { grantAllCollectionToAllPlayersUsecase } from './collection/usecases/grantAllCollectionToAllPlayers.usecase';
import { acknowledgeGrantedCardsUsecase } from './collection/usecases/acknowledgeGrantedCards.usecase';
import { getMyCollectionUsecase } from './collection/usecases/getMyCollection.usecase';

export const grantAllCollection = grantAllCollectionUsecase;
export const grantBasicCards = grantBasicCardsUsecase;
export const grantAllCollectionToAllPlayers = grantAllCollectionToAllPlayersUsecase;
export const acknowledgeGranted = acknowledgeGrantedCardsUsecase;
export const myCollection = getMyCollectionUsecase;
