import { useClerkProvide } from "vue-clerk";

export default defineNuxtRouteMiddleware(async () => {
  const nuxtApp = useNuxtApp();
  const { clerk, isClerkLoaded } = useClerkProvide();

  if (process.server && !nuxtApp.ssrContext?.event.context.auth?.userId) {
    return navigateTo("/play/login");
  }

  if (process.client) {
    await until(isClerkLoaded).toBe(true);
  }
  if (process.client && clerk.loaded && !clerk.user?.id) {
    return navigateTo("/play/login");
  }
});
