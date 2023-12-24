import { useClerkProvide } from 'vue-clerk';

export default defineNuxtRouteMiddleware(async () => {
  console.log('auth middleware');
  const nuxtApp = useNuxtApp();
  const { clerk, isClerkLoaded } = useClerkProvide();

  if (process.server && !nuxtApp.ssrContext?.event.context.auth?.userId) {
    return navigateTo({ name: 'Login' });
  }

  if (process.client) {
    await until(isClerkLoaded).toBe(true);
    console.log('clerk is loaded');
  }
  if (process.client && clerk.loaded && !clerk.user?.id) {
    return navigateTo({ name: 'Login' });
  }
});
