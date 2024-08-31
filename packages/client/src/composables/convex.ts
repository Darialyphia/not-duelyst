import {
  getFunctionName,
  type FunctionArgs,
  type FunctionReference,
  type FunctionReturnType,
  type PaginationOptions,
  type PaginationResult
} from 'convex/server';
import { CONVEX_CLIENT } from '../plugins/convex';
import {
  type DistributiveOmit,
  type Nullable,
  type Prettify,
  isDefined,
  isObject
} from '@game/shared';
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

export type PaginatedQueryReference<T> = FunctionReference<
  'query',
  'public',
  { paginationOpts: PaginationOptions },
  PaginationResult<T>
>;

export type PaginatedQueryArgs<T, Query extends PaginatedQueryReference<T>> = Prettify<
  DistributiveOmit<FunctionArgs<Query>, 'paginationOpts'>
>;

const isRecoverableError = (err: Error) => {
  return (
    err.message.includes('InvalidCursor') ||
    err.message.includes('ArrayTooLong') ||
    err.message.includes('TooManyReads') ||
    err.message.includes('TooManyDocumentsRead') ||
    err.message.includes('ReadsTooLarge')
  );
};

export type UseConvexPaginatedQueryOptions = {
  ssr?: boolean;
  throwOnSSRError?: boolean;
  numItems: number;
  enabled?: MaybeRef<boolean>;
};
export const useConvexPaginatedQuery = <T>(
  query: PaginatedQueryReference<T>,
  args: MaybeRefOrGetter<PaginatedQueryArgs<T, PaginatedQueryReference<T>>>,
  {
    numItems,
    ssr = true,
    throwOnSSRError = false,
    enabled
  }: UseConvexPaginatedQueryOptions
) => {
  type PageType = FunctionReturnType<PaginatedQueryReference<T>>;
  const client = useConvexClient();
  const subscribers = ref<(() => void)[]>([]);
  const queryName = computed(() => getFunctionName(query));
  const unwrappedArgs = computed(() => toValue(args));
  const isEnabled = computed(() => unref(enabled) ?? true);

  const pages = useState<PageType[]>(queryName.value, () => []); // prevent weird false type errors caused by vue's ref unwrapping types
  const isDone = ref(false);
  const error = ref<Nullable<Error>>();
  const lastPage = computed(() => {
    return pages.value.at(-1);
  });
  const isLoadingMore = ref(false);

  let resolve: (data: PageType['page'][]) => void;
  let reject: (err: Error) => void;
  const suspensePromise = new Promise<PageType['page'][]>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const reset = (refetch: boolean) => {
    subscribers.value.forEach(unsub => unsub());
    subscribers.value = [];
    pages.value = [];
    if (refetch) {
      nextTick(() => {
        loadPage(0);
      });
    }
  };

  let shouldIgnoreNullUpdates = isDefined(pages.value[0]);

  const loadPage = (index: number) => {
    subscribers.value[index]?.();
    if (pages.value.length && index > 0) {
      isLoadingMore.value = true;
    }
    subscribers.value[index] = client.onUpdate(
      query,
      {
        ...toValue(args),
        paginationOpts: {
          numItems: numItems,
          cursor: pages.value[index - 1]?.continueCursor ?? null
        }
      },
      newPage => {
        // If we fetched the data during SSR and the cache is populated, ignore the first convex updates that always return null
        // until we get a non null value, then we get completely driven by convex reactive state
        if (newPage === null && shouldIgnoreNullUpdates) return;
        if (newPage !== null) {
          shouldIgnoreNullUpdates = false;
        }
        pages.value[index] = newPage;
        resolve(pages.value.map(p => p.page));
        error.value = undefined;
        isDone.value = newPage.isDone;
        isLoadingMore.value = false;
      },
      err => {
        error.value = err;
        isLoadingMore.value = false;
        reject(err);
        if (isRecoverableError(err)) {
          reset(false);
        }
      }
    );
  };

  watch(queryName, () => reset(true));
  watch(unwrappedArgs, (newArgs, oldArgs) => {
    const hasChanged = JSON.stringify(newArgs) !== JSON.stringify(oldArgs);
    if (hasChanged) reset(true);
  });

  const nuxt = useNuxtApp();
  until(isEnabled)
    .toBeTruthy()
    .then(() => {
      if (!nuxt.ssrContext) {
        loadPage(0);
      }
    });

  onServerPrefetch(async () => {
    if (ssr) {
      try {
        const page = await client.querySSR(
          query,
          toValue({
            ...toValue(args),
            paginationOpts: {
              numItems: numItems,
              cursor: null
            }
          })
        );
        pages.value.push(page);
      } catch (err) {
        if (throwOnSSRError) {
          throw err;
        }
      }
    }
  });

  return {
    suspense: () => suspensePromise,
    pages: computed(() => pages.value.map(p => p.page)),
    data: computed(() => pages.value.filter(p => !!p).flatMap(p => p.page)),
    lastPage,
    error,
    isDone,
    isLoading: computed(() => !pages.value.length),
    isLoadingMore,
    loadMore: () => loadPage(pages.value.length),
    reset: () => reset(true)
  };
};

export const useConvexAuthedPaginatedQuery = <T>(
  query: PaginatedQueryReference<T>,
  args: MaybeRefOrGetter<PaginatedQueryArgs<T, PaginatedQueryReference<T>>>,
  {
    numItems,
    ssr = true,
    throwOnSSRError = false,
    enabled
  }: UseConvexPaginatedQueryOptions & { ssr?: boolean }
) => {
  const session = useSession();

  const result = useConvexPaginatedQuery(
    query,
    computed(() => ({ ...toValue(args), sessionId: session.value?.sessionId })),
    {
      ssr,
      numItems,
      throwOnSSRError,
      enabled: computed(() => {
        let _enabled = unref(enabled);
        if (_enabled === undefined) _enabled = true;

        return !!(_enabled && session.value?.sessionId);
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
