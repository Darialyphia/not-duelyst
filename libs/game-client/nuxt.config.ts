import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    'radix-vue/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'dayjs-nuxt',
    'nuxt-icon',
    '@nuxtjs/color-mode',
    '@vee-validate/nuxt'
  ],
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
  css: [
    'open-props/postcss/style',
    'open-props/colors-hsl',
    join(currentDir, './styles/global.css')
  ],
  postcss: {
    plugins: {
      '@unocss/postcss': {
        configOrPath: join(currentDir, './uno.config.ts')
      },
      'postcss-nesting': { noIsPseudoSelector: false },
      'postcss-custom-media': {
        preserve: false
      }
    }
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classPrefix: '',
    classSuffix: ''
  },
  unocss: {
    autoImport: false
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
