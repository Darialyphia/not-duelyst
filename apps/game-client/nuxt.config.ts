export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@vueuse/nuxt"],
  build: {
    transpile: ["vue-clerk", "@clerk/clerk-js"],
  },
  runtimeConfig: {
    public: {
      clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    },
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
  },
});
