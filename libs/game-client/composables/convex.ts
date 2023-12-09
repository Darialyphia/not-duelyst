import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server';
import { CONVEX_AUTH, CONVEX_CLIENT } from '../plugins/convex';
import type { Nullable } from '@hc/shared';

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

  const data = ref<FunctionReturnType<Query>>();
  const error = ref<Nullable<Error>>();
  let unsub: () => void;

  const isEnabled = computed(() => unref(options.enabled) ?? true);

  const bind = () => {
    unsub?.();
    if (isEnabled.value) {
      unsub = client.onUpdate(query, toValue(args), newData => {
        data.value = newData;
        error.value = undefined;
      });
    }
  };

  watch(isEnabled, bind, { immediate: true });
  watch(() => toValue(args), bind, { deep: true });

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
    mutate: async (args?: Mutation['_args']) => {
      try {
        isLoading.value = true;

        const result = await convex.mutation(mutation, args);
        onSuccess?.(result);
      } catch (err) {
        error.value = err as Error;
        onError?.(error.value);
      } finally {
        isLoading.value = false;
      }
    }
  };
}
