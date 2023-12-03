import { useClerkProvide } from "vue-clerk";

export default defineNuxtRouteMiddleware(async (route) => {
  const nuxtApp = useNuxtApp();
  const { clerk, isClerkLoaded } = useClerkProvide();

  if (process.server && !nuxtApp.ssrContext?.event.context.auth?.userId) {
    console.log(nuxtApp.ssrContext?.event.context.auth);
    return navigateTo("/play/login");
  }

  if (process.client) {
    await until(isClerkLoaded).toBe(true);
  }
  if (process.client && clerk.loaded && !clerk.user?.id) {
    console.log(
      "not authed !",
      route.fullPath,
      clerk.loaded,
      isClerkLoaded.value,
      clerk.user?.id,
    );
    return navigateTo("/play/login");
  }
});
