import {
  getFunctionName,
  type FunctionArgs,
  type FunctionReference,
  type FunctionReturnType
} from 'convex/server';
import { CONVEX_CLIENT } from '../plugins/convex';
import { type Nullable, isDefined, isObject } from '@game/shared';
import { ConvexError } from 'convex/values';

export const useConvexClient = () => {
  return useSafeInject(CONVEX_CLIENT);
};

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
  const queryName = getFunctionName(query);

  const data = useState<FunctionReturnType<Query>>(queryName, undefined);

  const error = ref<Nullable<Error>>();
  let unsub: () => void;

  const isEnabled = computed(() => unref(options.enabled) ?? true);

  let shouldIgnoreNullUpdates = isDefined(data.value);

  const bind = () => {
    if (nuxt.ssrContext) return;

    unsub?.();
    if (isEnabled.value) {
      unsub = client.onUpdate(
        query,
        toValue(args),
        newData => {
          // If we fetched the data during SSR and the cache is populated, ignore the first covnex updates that always return null
          // until we get a non null value, then we get completely driven by convex reactive state
          if (newData === null && shouldIgnoreNullUpdates) return;
          if (newData !== null) {
            shouldIgnoreNullUpdates = false;
          }

          data.value = newData;
          error.value = undefined;
        },
        err => {
          error.value = err;
        }
      );
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

  return {
    data,
    error,
    isLoading: computed(() => data.value === undefined && error.value === undefined)
  };
};

export const useConvexAuthedQuery = <Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'sessionId'>>,
  options: UseConvexQueryOptions = { ssr: true, enabled: true }
) => {
  const session = useSession();

  const result = useConvexQuery(
    query,
    computed(() => ({ ...toValue(args), sessionId: session.value?.sessionId })),
    {
      ssr: options.ssr,
      enabled: computed(() => {
        let enabled = unref(options.enabled);
        if (enabled === undefined) enabled = true;

        return !!(enabled && session.value?.sessionId);
      })
    }
  );

  watchEffect(() => {
    const { error } = result;

    if (error.value instanceof ConvexError) {
      if (
        isObject(error.value.data) &&
        'code' in error.value.data &&
        error.value.data.code === 'INVALID_SESSION'
      ) {
        session.value = null;
        navigateTo({ name: 'Login' });
      }
    }
  });
  return result;
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
  const session = useSession();

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
        if (err instanceof ConvexError) {
          if (isObject(err.data) && 'code' in err && err.code === 'INVALID_SESSION') {
            session.value = null;
            navigateTo({ name: 'Login' });
          }
        }
        onError?.(error.value);
      } finally {
        isLoading.value = false;
      }
    }
  };
}

export const useConvexAuthedMutation = <Mutation extends MutationReference>(
  ...args: Parameters<typeof useConvexMutation<Mutation>>
) => {
  const sessionId = useSessionId();
  const { mutate, ...rest } = useConvexMutation(...args);
  return {
    ...rest,
    mutate(mutationArgs: Omit<Mutation['_args'], 'sessionId'>) {
      if (!sessionId.value) return;
      return mutate({
        ...mutationArgs,
        sessionId: sessionId.value
      });
    }
  };
};
