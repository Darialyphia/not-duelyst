<script setup lang="ts">
import { BLEND_MODES, Texture } from 'pixi.js';
import { useScreen } from 'vue3-pixi';
import { debounce } from 'lodash-es';

const screen = useScreen();

function gradient() {
  const c = document.createElement('canvas');
  c.width = screen.value.width;
  c.height = screen.value.height;
  const ctx = c.getContext('2d')!;
  const grd = ctx.createLinearGradient(0, 0, screen.value.width, 0);
  grd.addColorStop(0, 'rgba(67,45,146,237)');
  grd.addColorStop(1, 'rgba(147,39,143,237)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, screen.value.width, screen.value.height);

  return Texture.from(c);
}

const texture = ref(gradient()) as Ref<Texture>;
const debouncedResize = debounce(() => {
  texture.value = gradient();
}, 100);
useEventListener(window, 'resize', debouncedResize);
</script>

<template>
  <graphics
    event-mode="none"
    :alpha="0.4"
    :blend-mode="BLEND_MODES.SCREEN"
    @render="
      g => {
        g.clear();
        g.beginTextureFill({ texture });
        g.drawRect(0, 0, screen.width, screen.height);
        g.endFill();
      }
    "
  />
</template>
