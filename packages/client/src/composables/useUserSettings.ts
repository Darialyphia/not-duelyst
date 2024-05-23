import { api } from '@game/api';
import { merge } from 'lodash-es';
import type { Settings } from '../utils/settings';

export const useUserSettings = () => {
  const sessionId = useSessionId();
  const { data: settings } = useConvexQuery(
    api.users.settings,
    { sessionId: sessionId.value! },
    { enabled: !!sessionId.value }
  );

  return computed(() => {
    return merge(getDefaultSettings(), settings.value ?? {}) as Settings;
  });
};
