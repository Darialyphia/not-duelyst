import { isCustomElement, transformAssetUrls } from 'vue3-pixi/compiler';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import glsl from 'vite-plugin-glsl';

const currentDir = dirname(fileURLToPath(import.meta.url));

const customElements = ['viewport', 'layer', 'point-light', 'ambient-light'];
const prefix = 'pixi-';

export default defineNuxtConfig({
  srcDir: './src',
  devtools: { enabled: true },
  experimental: { inlineRouteRules: true },
  devServer: {
    port: 3000
  },
  modules: [
    '@vee-validate/nuxt',
    'radix-vue/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'dayjs-nuxt',
    'nuxt-icon',
    '@nuxtjs/color-mode',
    '@formkit/auto-animate/nuxt',
    '@nuxt/content'
  ],

  runtimeConfig: {
    public: {
      convexUrl: '',
      hathoraAppId: ''
    }
  },

  routeRules: {
    '/play/**': {
      ssr: false
    }
  },

  components: [
    {
      path: './components',
      pathPrefix: false
    }
  ],
  css: [
    'open-props/postcss/style',
    'open-props/colors-hsl',
    join(currentDir, './src/styles/global.css')
  ],
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        types: ['vite-plugin-glsl/ext']
      }
    }
  },
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
  },
  postcss: {
    plugins: {
      autoprefixer: true,
      '@unocss/postcss': {
        configOrPath: join(currentDir, './uno.config.ts')
      },
      'postcss-viewport-unit-fallback': {},
      'postcss-nesting': { noIsPseudoSelector: false },
      'postcss-custom-media': {
        preserve: false
      },
      'postcss-scrollbar': {}
    }
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classPrefix: '',
    classSuffix: ''
  },
  unocss: {
    autoImport: false
  },
  dayjs: {
    locales: ['en', 'fr'],
    plugins: ['relativeTime', 'utc', 'timezone', 'duration'],
    defaultLocale: 'en'
  }
});
