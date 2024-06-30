// declare namespace Lucia {
//   type Auth = import('./auth/lucia.adapter').Auth;
//   type DatabaseUserAttributes = {
//     _id: import('./_generated/dataModel').Id<'users'>;
//     _creationTime: number;
//     email: string;
//     name?: string;
//     discriminator?: string;
//     mmr: number;
//     hasOnboarded: boolean;
//     presence: 'offline' | 'online' | 'away';
//   };
//   type DatabaseSessionAttributes = {
//     _id: import('./_generated/dataModel').Id<'sessions'>;
//     _creationTime: number;
//   };
// }

// declare module 'lucia' {
//   type Auth = import('./auth/lucia.adapter').Auth;
//   interface Register {
//     Lucia: typeof Auth;
//     DatabaseSessionAttributes: DatabaseSessionAttributes;
//     DatabaseUserAttributes: DatabaseUserAttributes;
//   }
// }

// interface DatabaseSessionAttributes {
//   _id: import('./_generated/dataModel').Id<'sessions'>;
//   _creationTime: number;
// }
// interface DatabaseUserAttributes {
//   _id: import('./_generated/dataModel').Id<'users'>;
//   _creationTime: number;
//   email: string;
//   name?: string;
//   discriminator?: string;
//   mmr: number;
//   hasOnboarded: boolean;
//   presence: 'offline' | 'online' | 'away';
// }
