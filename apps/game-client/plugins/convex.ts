import type { InjectionKey } from "nuxt/dist/app/compat/capi";
import { useAuth } from "vue-clerk";
import { createApiClient, createApiHttpClient } from "@hc/api";
import { ConvexClient, ConvexHttpClient } from "convex/browser";

export const CONVEX_CLIENT = Symbol(
  "convex-client"
) as InjectionKey<ConvexClient>;
export const CONVEX_AUTH = Symbol("convex-auth") as InjectionKey<{
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
}>;
export const CONVEX_HTTP_CLIENT = Symbol(
  "convex-http-client"
) as InjectionKey<ConvexHttpClient>;

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
      return getToken.value({
        template: "convex",
        skipCache: forceRefreshToken,
      });
    } catch (error) {
      return null;
    }
  };

  const convexUrl = config.public.convexUrl as string;
  const convexClient = createApiClient(convexUrl);
  const convexHttpClient = createApiHttpClient(convexUrl);

  const authState = {
    isLoading: ref(!isClerkLoaded.value),
    isAuthenticated: ref(isClerkAuthenticated.value ?? false),
  };

  nuxt.vueApp.provide(CONVEX_CLIENT, convexClient);
  nuxt.vueApp.provide(CONVEX_HTTP_CLIENT, convexHttpClient);
  nuxt.vueApp.provide(CONVEX_AUTH, {
    isLoading: readonly(authState.isLoading),
    isAuthenticated: readonly(authState.isAuthenticated),
  });

  const syncConvexAuthWithAuth0Auth = async () => {
    if (!authState.isLoading.value && !isClerkLoaded.value) {
      authState.isLoading.value = true;
    }

    if (!isClerkLoaded.value) return;

    if (authState.isAuthenticated.value) {
      convexClient.setAuth(fetchAccessToken, (isAuth) => {
        authState.isAuthenticated.value = isAuth;
        authState.isLoading.value = false;
      });

      const setHttpAuth = async () => {
        const token = await fetchAccessToken({ forceRefreshToken: true });
        if (token) {
          convexHttpClient.setAuth(token);
        } else {
          convexHttpClient.clearAuth();
        }
      };
      const promise = setHttpAuth();
      if (process.server) {
        await promise;
      }
    } else {
      convexClient.client.clearAuth();
      convexHttpClient.clearAuth();

      authState.isAuthenticated.value = false;
      authState.isLoading.value = false;
    }
  };

  watchEffect(syncConvexAuthWithAuth0Auth);
});
