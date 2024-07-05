<script setup lang="ts">
import { useScreen, PTransition } from 'vue3-pixi';
import { debounce } from 'lodash-es';
import { Texture } from 'pixi.js';

const screen = useScreen();
const { ui } = useGame();

function gradient() {
  const c = document.createElement('canvas');
  c.width = screen.value.width;
  c.height = screen.value.height;
  const ctx = c.getContext('2d')!;

  const smallestSide = Math.min(screen.value.width, screen.value.height);

  const gradient = ctx.createRadialGradient(
    screen.value.width / 2,
    screen.value.height / 2,
    smallestSide / 2,
    screen.value.width / 2,
    screen.value.height / 2,
    smallestSide
  );

  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.9, 'rgba(0,0,0,0.5)');

  ctx.fillStyle = gradient;
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
  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <graphics
      v-if="ui.targetingMode.value === TARGETING_MODES.FOLLOWUP"
      event-mode="none"
      :alpha="0.7"
      @render="
        g => {
          g.clear();
          g.beginTextureFill({ texture });
          g.drawRect(0, 0, screen.width, screen.height);
          g.endFill();
        }
      "
    />
  </PTransition>
</template>
