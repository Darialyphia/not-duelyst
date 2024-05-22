import { api } from '@game/api';
import { ONE_MINUTE_IN_MS } from '@game/shared';

export const usePresence = () => {
  const { mutate: updatePresence } = useConvexAuthedMutation(api.users.updatePresence);

  const visibility = useDocumentVisibility();
  const isHidden = computed(() => visibility.value === 'hidden');

  useIntervalFn(
    () => {
      updatePresence({
        presence: isHidden.value ? 'away' : 'online'
      });
    },
    computed(() => (isHidden.value ? ONE_MINUTE_IN_MS : 10_000)),
    { immediate: true }
  );
};
