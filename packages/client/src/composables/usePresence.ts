import { api } from '@game/api';
import { ONE_MINUTE_IN_MS } from '@game/shared';

export const usePresence = () => {
  const { mutate: updatePresence } = useConvexAuthedMutation(api.users.updatePresence);

  const visibility = useDocumentVisibility();
  const isHidden = computed(() => visibility.value === 'hidden');

  const interval = computed(() => {
    if (import.meta.env.DEV) return isHidden.value ? ONE_MINUTE_IN_MS * 10 : 30_000;

    return isHidden.value ? ONE_MINUTE_IN_MS : 10_000;
  });

  useIntervalFn(
    () => {
      updatePresence({
        presence: isHidden.value ? 'away' : 'online'
      });
    },
    interval,
    { immediate: true }
  );

  watchEffect(() => {
    if (!isHidden.value) {
      updatePresence({ presence: 'online' });
    }
  });
};
