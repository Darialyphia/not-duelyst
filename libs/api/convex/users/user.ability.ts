import { PureAbility } from '@casl/ability';
import type { User } from './user.entity';
import { createAbility } from '../utils/ability';
import type { QueryCtx } from '../_generated/server';

type UserActions = 'read' | 'edit' | 'create';

type Abilities = [UserActions, 'user' | User];

export type UserAbility = PureAbility<Abilities>;

const unAuthenticatedAbility = createAbility<UserAbility>(({ can }) => {
  can('read', 'user');
});

const onboardingAbility = createAbility<UserAbility>(({ can }) => {
  can('create', 'user');
});

export const createUserAbility = async ({
  auth,
  db
}: Pick<QueryCtx, 'auth' | 'db'>): Promise<UserAbility> => {
  const identity = await auth.getUserIdentity();

  if (!identity) return unAuthenticatedAbility;

  const sessionUser = await db
    .query('users')
    .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .unique();

  if (!sessionUser) return onboardingAbility;

  return createAbility<UserAbility>(({ can }) => {
    can('read', 'user');
    can('edit', 'user', (subject: User) => {
      return subject._id === identity.tokenIdentifier;
    });
  });
};
