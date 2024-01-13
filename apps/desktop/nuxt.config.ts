// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'src',
  devtools: { enabled: true },
  extends: ['@hc/game-client'],
  modules: ['nuxt-electron'],
  electron: {
    build: [
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main.ts'
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
          // instead of restarting the entire Electron App.
          options.reload();
        }
      }
    ]
  }
});
