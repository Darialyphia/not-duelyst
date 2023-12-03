import { useClerkProvide } from "vue-clerk";

export default defineNuxtRouteMiddleware(async (route) => {
  const nuxtApp = useNuxtApp();
  const { clerk, isClerkLoaded } = useClerkProvide();

  if (process.server && nuxtApp.ssrContext?.event.context.auth?.userId)
    return navigateTo("/play");

  if (process.client) {
    await until(isClerkLoaded).toBe(true);
  }
  if (process.client && clerk.user?.id) {
    return navigateTo("/play");
  }
});
