import { FunctionReference, FunctionReturnType, OptionalRestArgs } from 'convex/server';
import { api as convexApi } from './convex/_generated/api';
// eslint-disable-next-line import/named
import { ConvexClient, ConvexClientOptions, ConvexHttpClient } from 'convex/browser';
import { Nullable, isString } from '@hc/shared';

type AuthTokenFetcher = (args: {
  forceRefreshToken: boolean;
}) => Promise<string | null | undefined>;

export class ConvexClientWithSSR extends ConvexClient {
  private httpClient: ConvexHttpClient;
  private authTokenFetcher?: AuthTokenFetcher;
  private ssrAuthToken?: Nullable<string>;
  private ssrOnTokenChange?: (isAuthenticated: boolean) => void;

  constructor(address: string, options: ConvexClientOptions = {}) {
    super(address, options);
    this.httpClient = new ConvexHttpClient(address);
  }

  setAuth(fetchToken: AuthTokenFetcher, onChange?: (isAuthenticated: boolean) => void) {
    super.setAuth(fetchToken, onChange);
    this.authTokenFetcher = fetchToken;
    this.ssrOnTokenChange = onChange;
  }

  async querySSR<Query extends FunctionReference<'query'>>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): Promise<FunctionReturnType<Query>> {
    if (this.ssrAuthToken === undefined) {
      this.ssrAuthToken = await this.authTokenFetcher?.({ forceRefreshToken: true });
      this.ssrOnTokenChange?.(isString(this.ssrAuthToken));
      if (isString(this.ssrAuthToken)) {
        this.httpClient.setAuth(this.ssrAuthToken);
      }
    }

    return this.httpClient.query(query, ...args);
  }
}

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
