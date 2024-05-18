import { api } from '@game/api';
import { ONE_WEEK_IN_SECONDS, type AnyFunction } from '@game/shared';

export const useSession = () => {
  const session = useCookie<{ sessionId: string; expiresAt: number } | null>(
    'session-id',
    {
      maxAge: ONE_WEEK_IN_SECONDS * 2
    }
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
