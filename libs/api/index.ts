import { api as convexApi } from './convex/_generated/api';

// This allows use to catch the function referenc ename of a convex query
// This is useful for exmaple in the client where we can cache ConvexHttpClient query result between server and client
const createApiWrapper = <T extends object>(obj: T, pathParts: string[] = []): T => {
  const handler: ProxyHandler<object> = {
    get(_, prop: string | symbol) {
      if (prop === '__query_name') {
        return pathParts.join('.');
      } else if (typeof prop === 'string') {
        const newParts = [...pathParts, prop];
        // @ts-expect-error
        return createApiWrapper(obj[prop], newParts);
      } else {
        // @ts-expect-error
        return obj[prop];
      }
    }
  };

  return new Proxy(obj, handler) as T;
};

export const api = createApiWrapper(convexApi);
export { convexApi };
export { ConvexClientWithSSR } from './convexClientSSR';
export type { UserDto } from './convex/users/user.mapper';
export type { GameMapDto } from './convex/gameMap/gameMap.mapper';
