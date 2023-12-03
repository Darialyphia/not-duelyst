import type { InjectionKey } from "nuxt/dist/app/compat/capi";
import { useAuth } from "vue-clerk";
import { ConvexClientWithSSR } from "@hc/api";

export const CONVEX_CLIENT = Symbol(
  "convex-client"
) as InjectionKey<ConvexClientWithSSR>;
export const CONVEX_AUTH = Symbol("convex-auth") as InjectionKey<{
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
}>;

export default defineNuxtPlugin(async (nuxt) => {
  const {
    isLoaded: isClerkLoaded,
    isSignedIn: isClerkAuthenticated,
    getToken,
  } = useAuth();
  const config = useRuntimeConfig();

  const fetchAccessToken = async ({
    forceRefreshToken,
  }: {
    forceRefreshToken: boolean;
  }) => {
    try {
      if (process.server) {
        return nuxt.ssrContext?.event.context.auth.getToken({
          template: "convex",
        });
      } else {
        return getToken.value({
          template: "convex",
          skipCache: forceRefreshToken,
        });
      }
    } catch (error) {
      return null;
    }
  };

  const convexClient = new ConvexClientWithSSR(config.public.convexUrl);

  const authState = {
    isLoading: ref(!isClerkLoaded.value),
    isAuthenticated: ref(isClerkAuthenticated.value ?? false),
  };

  nuxt.vueApp.provide(CONVEX_CLIENT, convexClient);
  nuxt.vueApp.provide(CONVEX_AUTH, {
    isLoading: readonly(authState.isLoading),
    isAuthenticated: readonly(authState.isAuthenticated),
  });

  const syncConvexAuthWithClerkAuth = async () => {
    if (!authState.isLoading.value && !isClerkLoaded.value) {
      authState.isLoading.value = true;
    }

    if (!isClerkLoaded.value) return;

    if (isClerkAuthenticated.value) {
      convexClient.setAuth(fetchAccessToken, (isAuth) => {
        authState.isAuthenticated.value = isAuth;
        authState.isLoading.value = false;
      });
    } else {
      convexClient.client.clearAuth();

      authState.isAuthenticated.value = false;
      authState.isLoading.value = false;
    }
  };

  if (process.server && nuxt.ssrContext?.event.context.auth.userId) {
    convexClient.setAuth(fetchAccessToken, (isAuth) => {
      authState.isAuthenticated.value = isAuth;
      authState.isLoading.value = false;
    });
  }
  watchEffect(syncConvexAuthWithClerkAuth);
});
