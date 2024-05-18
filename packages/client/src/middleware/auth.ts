import { api } from '@game/api';

export default defineNuxtRouteMiddleware(async () => {
  const session = useSession();
  if (!session.value || !session.value?.sessionId) {
    return navigateTo({ name: 'Login' });
  }
  const { sessionId } = session.value;
  const convex = useConvexClient();

  const invalidateAndRedirect = () => {
    session.value = null;
    return navigateTo({ name: 'Login' });
  };

  try {
    if (!session.value.expiresAt) {
      await convex.mutation(api.auth.signOff, { sessionId: sessionId });

      return invalidateAndRedirect();
    }

    const isExpired = Date.now() >= Number(session.value.expiresAt);
    if (!isExpired) return;

    const result = await convex.mutation(api.auth.validateSession, {
      sessionId: session.value.sessionId
    });
    session.value = result;

    if (!result && process.client) {
      await convex.mutation(api.auth.signOff, { sessionId: sessionId });
      return invalidateAndRedirect();
    }
  } catch (err) {
    return invalidateAndRedirect();
  }
});
