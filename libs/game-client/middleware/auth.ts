import { useSessionId } from '../composables/useSession';
import { api } from '@hc/api';

export default defineNuxtRouteMiddleware(async () => {
  const sessionId = useSessionId();
  if (sessionId.value) {
    try {
      const convex = useConvexClient();
      const result = await convex.mutation(api.auth.validateSession, {
        sessionId: sessionId.value
      });
      if (!result.ok && process.client) {
        await $fetch('/api/signoff');
        sessionId.value = null;
        return navigateTo({ name: 'Login' });
      }
    } catch (err) {
      useCookie('sessionId').value = null;
      return navigateTo({ name: 'Login' });
    }
  }

  if (!sessionId.value) {
    return navigateTo({ name: 'Login' });
  }
});
