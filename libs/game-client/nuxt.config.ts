import { isCustomElement, transformAssetUrls } from 'vue3-pixi';
// eslint-disable-next-line import/no-unresolved
import { createResolver } from '@nuxt/kit';

import glsl from 'vite-plugin-glsl';

const customElements = ['viewport', 'layer'];
const prefix = 'pixi-';

const resolver = createResolver(import.meta.url);

export default defineNuxtConfig({
  extends: ['@hc/ui'],
  devtools: { enabled: true },
  modules: ['@vee-validate/nuxt' /*'@pinia/nuxt'*/],
  build: {
    transpile: ['vue-clerk', '@clerk/clerk-js']
  },
  runtimeConfig: {
    public: {
      convexUrl: process.env.CONVEX_URL,
      clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY
    },
    hathoraAppId: process.env.HARHOTA_APP_ID,
    clerkSecretKey: process.env.CLERK_SECRET_KEY
  },
  components: [
    {
      path: './components',
      pathPrefix: false
    }
  ],
  vite: {
    plugins: [glsl()],
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true
      },
      template: {
        compilerOptions: {
          isCustomElement(name) {
            let normalizedName = name.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
            if (normalizedName.startsWith('-')) normalizedName = normalizedName.slice(1);

            const isPixiElement = customElements.includes(normalizedName);
            const isPrefixElement =
              normalizedName.startsWith(prefix) &&
              customElements.includes(normalizedName.slice(prefix.length));

            return isCustomElement(name) || isPixiElement || isPrefixElement;
          }
        },
        transformAssetUrls
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
  // pinia: {
  //   storesDirs: [resolver.resolve('stores')]
  // }
});
