import { useClerkProvide } from 'vue-clerk';

export default defineNuxtRouteMiddleware(async () => {
  const nuxtApp = useNuxtApp();
  const { clerk, isClerkLoaded } = useClerkProvide();

  if (process.server && nuxtApp.ssrContext?.event.context.auth?.userId)
    return navigateTo('/play');

  if (!process.client) return;
  await until(isClerkLoaded).toBe(true);

  if (clerk.user?.id) {
    return navigateTo('/play');
  }
});
