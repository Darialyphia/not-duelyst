import type { FunctionArgs, FunctionReference } from 'convex/server';
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

  const data = ref();
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
