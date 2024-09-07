import { api } from '@game/api';
import { ONE_WEEK_IN_SECONDS, type AnyFunction } from '@game/shared';

export const useSession = () => {
  const sessionCookie = useCookie<{ sessionId: string; expiresAt: number } | null>(
    'session-id',
    {
      maxAge: ONE_WEEK_IN_SECONDS * 2
    }
  );

  // see https://github.com/nuxt/nuxt/issues/13020#issuecomment-1397282762
  const session = useState('session', () => sessionCookie.value);

  watch(
    session,
    () => {
      sessionCookie.value = session.value;
    },
    { deep: true }
  );

  return session;
};

export const useSessionId = () => {
  const session = useSession();
  return computed(() => session.value?.sessionId);
};

export const useSignIn = (onError?: AnyFunction) => {
  const session = useSession();

  return useConvexMutation(api.auth.signIn, {
    onSuccess(data) {
      session.value = data;
      navigateTo({ name: 'ClientHome' });
    },
    onError
  });
};
