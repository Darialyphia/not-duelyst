import { api } from '@game/api';
import type { Settings } from '../utils/settings';
import type { InjectionKey } from 'vue';

export type UserSettingsContext = { settings: Ref<Settings>; save: () => void };
export const USER_SETTINGS_INJECTION_KEY = Symbol(
  'user_settings'
) as InjectionKey<UserSettingsContext>;

export const useUserSettingsProvider = () => {
  const sessionId = useSessionId();

  const settings = ref(getDefaultSettings());
  const isLoggedIn = computed(() => !!sessionId.value);

  const { data: savedSettings } = useConvexQuery(
    api.users.settings,
    computed(() => ({ sessionId: sessionId.value! })),
    { enabled: isLoggedIn }
  );
  watchEffect(() => {
    if (savedSettings.value) {
      settings.value = Object.assign(
        getDefaultSettings(),
        savedSettings.value
      ) as Settings;
    }
  });

  const { mutate: saveSettings } = useConvexMutation(api.users.saveSettings);

  provide(USER_SETTINGS_INJECTION_KEY, {
    settings,
    save: () => {
      if (!sessionId.value) return;
      saveSettings({ settings: settings.value, sessionId: sessionId.value });
    }
  });
};

export const useUserSettings = () => useSafeInject(USER_SETTINGS_INJECTION_KEY);
