import { grantAllCollectionUsecase } from './collection/usecases/grant-all-collection.usecase';
import { grantBasicCardsUsecase } from './collection/usecases/grant-basic-card.usecase';
import { grantAllCollectionToAllPlayersUsecase } from './collection/usecases/grant-all-collection-to-all-players.usecase';
import { acknowledgeGrantedCardsUsecase } from './collection/usecases/acknowledge-granted-cards.usecase';
import { getMyCollectionUsecase } from './collection/usecases/get-my-collection.usecase';

export const grantAllCollection = grantAllCollectionUsecase;
export const grantBasicCards = grantBasicCardsUsecase;
export const grantAllCollectionToAllPlayers = grantAllCollectionToAllPlayersUsecase;
export const acknowledgeGranted = acknowledgeGrantedCardsUsecase;
export const myCollection = getMyCollectionUsecase;
