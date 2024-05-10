import { api } from '@game/api';
import { merge } from 'lodash-es';
import type { Settings } from '../utils/settings';

export const useUserSettings = () => {
  const { data: settings } = useConvexAuthedQuery(api.users.settings, {});

  return computed(() => {
    return merge(getDefaultSettings(), settings.value) as Settings;
  });
};
