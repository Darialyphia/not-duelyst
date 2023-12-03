import { CONVEX_AUTH, CONVEX_CLIENT } from "../plugins/convex";

export const useConvexClient = () => {
  return useSafeInject(CONVEX_CLIENT);
};

export const useConvexAuth = () => useSafeInject(CONVEX_AUTH);
