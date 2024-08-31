declare namespace Lucia {
  type Auth = import('./auth/lucia.adapter').Auth;
  type DatabaseUserAttributes = {
    _id: import('./_generated/dataModel').Id<'users'>;
    _creationTime: number;
    email: string;
    name?: string;
    discriminator?: string;
    mmr: number;
    avatar: string;
    slug?: string;
    hasOnboarded: boolean;
    presence: 'offline' | 'online' | 'away';
  };
  type DatabaseSessionAttributes = {
    _id: import('./_generated/dataModel').Id<'sessions'>;
    _creationTime: number;
  };
}
