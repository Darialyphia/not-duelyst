import { api } from './convex/_generated/api';
import { ConvexClient, ConvexHttpClient } from 'convex/browser';

const createApiClient = (url: string) => new ConvexClient(url);
const createApiHttpClient = (url: string) => new ConvexHttpClient(url);

export { api, createApiClient, createApiHttpClient };
