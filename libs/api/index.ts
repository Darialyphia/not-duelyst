import { FunctionReference, FunctionReturnType, OptionalRestArgs } from 'convex/server';
import { api } from './convex/_generated/api';
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

export { api };
