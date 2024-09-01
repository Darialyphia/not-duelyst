export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // This will be an object representation of the html template.
    if (event.path.includes('/play') || event.path.includes('/replay')) {
      html.body.push(`            <div id="app-loader" style="
            height: 100dvh; 
            display: grid; 
            place-content: center;   
            background: black;
            background-attachment: fixed;
            background-size: cover;
            position: absolute;
            inset: 0;
            z-index: 1"
          >
            <img src="/assets/ui/mystic_loading.gif">
          </div>`);
    }
  });
});
