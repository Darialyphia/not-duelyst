import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server';
import { CONVEX_AUTH, CONVEX_CLIENT } from '../plugins/convex';
import { type Nullable, isDefined } from '@hc/shared';

export const useConvexClient = () => {
  return useSafeInject(CONVEX_CLIENT);
};

export const useConvexAuth = () => useSafeInject(CONVEX_AUTH);

type UseConvexQueryOptions = {
  ssr?: boolean;
  enabled?: MaybeRef<boolean>;
};

type QueryReference = FunctionReference<'query'>;
export const useConvexQuery = <Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions = { ssr: true, enabled: true }
) => {
  const client = useConvexClient();
  const nuxt = useNuxtApp();
  // @ts-expect-error
  const queryName = query.__query_name;

  const data = useState<FunctionReturnType<Query>>(queryName, undefined);

  const error = ref<Nullable<Error>>();
  let unsub: () => void;

  const isEnabled = computed(() => unref(options.enabled) ?? true);

  let shouldIgnoreNullUpdates = isDefined(data.value);

  const bind = () => {
    if (nuxt.ssrContext) return;

    unsub?.();
    if (isEnabled.value) {
      unsub = client.onUpdate(query, toValue(args), newData => {
        // If we fetched the data during SSR and the cache is populated, ignore the first covnex updates that always return null
        // until we get a non null value, then we get completely driven by convex reactive state
        if (newData === null && shouldIgnoreNullUpdates) return;
        if (newData !== null) {
          shouldIgnoreNullUpdates = false;
        }

        data.value = newData;
        error.value = undefined;
      });
    }
  };

  watch(isEnabled, bind, { immediate: true });
  // watch(() => toValue(args), bind, { deep: true });

  onServerPrefetch(async () => {
    if (options.ssr) {
      try {
        data.value = await client.querySSR(query, toValue(args));
      } catch (err) {
        error.value = err as Error;
      }
    }
  });

  return { data, error, isLoading: computed(() => data.value === undefined) };
};

export const useConvexAuthedQuery = <Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions = { ssr: true, enabled: true }
) => {
  const auth = useConvexAuth();
  return useConvexQuery(query, args, {
    ssr: options.ssr,
    enabled: computed(() => {
      const enabled = unref(options.enabled);
      return !!(enabled && auth.isAuthenticated.value);
    })
  });
};

export type MutationReference = FunctionReference<'mutation'>;
export function useConvexMutation<Mutation extends MutationReference>(
  mutation: Mutation,
  {
    onSuccess,
    onError
  }: {
    onSuccess?: (data: FunctionReturnType<Mutation>) => void;
    onError?: (err: Error) => void;
  } = {}
) {
  const convex = useConvexClient();

  const isLoading = ref(false);
  const error = ref<Nullable<Error>>();

  return {
    isLoading,
    error,
    mutate: async (args: Mutation['_args']) => {
      try {
        isLoading.value = true;
        const result = await convex.mutation(mutation, args);
        onSuccess?.(result);
        return result;
      } catch (err) {
        error.value = err as Error;
        onError?.(error.value);
      } finally {
        isLoading.value = false;
      }
    }
  };
}
