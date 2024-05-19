import { internalQuery } from '../../_generated/server';

export const getAllUsersUsecase = internalQuery(({ db }) => db.query('users').collect());
