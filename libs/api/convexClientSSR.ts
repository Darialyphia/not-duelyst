import { FunctionReference, FunctionReturnType, OptionalRestArgs } from 'convex/server';
import { ConvexClient, type ConvexClientOptions, ConvexHttpClient } from 'convex/browser';
import { Nullable, isString } from '@hc/shared';

type AuthTokenFetcher = (args: {
  forceRefreshToken: boolean;
}) => Promise<string | null | undefined>;

export class ConvexClientWithSSR extends ConvexClient {
  private httpClient: ConvexHttpClient;
  private authTokenFetcher?: AuthTokenFetcher;
  private ssrAuthToken?: Nullable<string>;
  private ssrOnTokenChange?: (isAuthenticated: boolean) => void;
  private ssrQueriesCache = new Map<string, Map<string, any>>(); // oh god

  private ssrAuthTokenPromise: Promise<string | null | undefined> | null = null;

  constructor(address: string, options: ConvexClientOptions = {}) {
    super(address, options);
    this.httpClient = new ConvexHttpClient(address);
  }

  setAuth(fetchToken: AuthTokenFetcher, onChange?: (isAuthenticated: boolean) => void) {
    super.setAuth(fetchToken, onChange);
    this.authTokenFetcher = fetchToken;
    this.ssrOnTokenChange = onChange;
  }

  private fetchAuthTokenSSR() {
    if (!this.ssrAuthTokenPromise) {
      this.ssrAuthTokenPromise = this.authTokenFetcher!({ forceRefreshToken: true });
    }

    return this.ssrAuthTokenPromise;
  }

  async querySSR<Query extends FunctionReference<'query'>>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): Promise<FunctionReturnType<Query>> {
    // @ts-expect-error convex expose function reference symbol when pepeHands
    const queryName = query.__query_name;

    if (!this.ssrQueriesCache.has(queryName)) {
      console.log('create cache for', queryName);
      this.ssrQueriesCache.set(queryName, new Map());
    }
    const cache = this.ssrQueriesCache.get(queryName)!;

    const cacheKey = JSON.stringify(args);
    if (!cache.has(cacheKey)) {
      console.log('create query cache for', cacheKey);
      const promise = async () => {
        if (this.ssrAuthToken === undefined) {
          this.ssrAuthToken = await this.fetchAuthTokenSSR();
          this.ssrOnTokenChange?.(isString(this.ssrAuthToken));
          if (isString(this.ssrAuthToken)) {
            this.httpClient.setAuth(this.ssrAuthToken);
          }
        }

        return this.httpClient.query(query, ...args);
      };
      cache.set(cacheKey, promise());
    }

    return cache.get(cacheKey) as Promise<FunctionReturnType<Query>>;
  }
}
