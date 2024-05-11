declare namespace Lucia {
  type Auth = import('./lucia').Auth;
  type DatabaseUserAttributes = {
    _id: import('./_generated/dataModel').Id<'users'>;
    _creationTime: number;
    email: string;
    name?: string;
    discriminator?: string;
    mmr: number;
    hasOnboarded: boolean;
  };
  type DatabaseSessionAttributes = {
    _id: import('./_generated/dataModel').Id<'sessions'>;
    _creationTime: number;
  };
}
