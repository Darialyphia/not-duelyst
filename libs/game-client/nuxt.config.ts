import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  extends: ['@hc/ui'],
  devtools: { enabled: true },
  modules: ['@vee-validate/nuxt'],
  build: {
    transpile: ['vue-clerk', '@clerk/clerk-js']
  },
  runtimeConfig: {
    public: {
      convexUrl: process.env.CONVEX_URL,
      clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY
    },
    clerkSecretKey: process.env.CLERK_SECRET_KEY
  },
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }
  },
  veeValidate: {
    // disable or enable auto imports
    autoImports: true,
    // Use different names for components
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage'
    }
  }
});
