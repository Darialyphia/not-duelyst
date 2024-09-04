<script setup lang="ts">
import { waitFor } from '@game/shared';
import { diffuseGroup, normalGroup, lightGroup } from '@pixi/lights';
import { BLEND_MODES, Point } from 'pixi.js';
import { useScreen, useStage } from 'vue3-pixi';
const { ui } = useGame();
const screen = useScreen();

useGameControls();
const cells = useCellsViewModels();
const entities = useGameSelector(session => session.entitySystem.getList());
const isDev = import.meta.env.DEV;
const { settings } = useUserSettings();

const vfxTint = {
  alpha: ref(0),
  color: ref('#ffffff'),
  blendMode: ref(BLEND_MODES.NORMAL)
};

useVFX('tintScreen', async ({ color, alpha, blendMode, duration }) => {
  gsap.to(vfxTint.alpha, { value: alpha, duration: 0.15 });
  gsap.to(vfxTint.color, { value: color, duration: 0.15 });
  vfxTint.blendMode.value = blendMode;

  await waitFor(duration - 150);
  gsap.to(vfxTint.alpha, { value: 0, duration: 0.15 });
  gsap.to(vfxTint.color, { value: '#ffffff', duration: 0.15 });
  await waitFor(150);
  vfxTint.blendMode.value = BLEND_MODES.NORMAL;
});

const stage = useStage();

const shaker = useShaker(stage);
useVFX('shakeScreen', async ({ isBidirectional, amplitude, duration }) => {
  shaker.trigger({
    isBidirectional,
    shakeAmount: amplitude,
    shakeDelay: 25,
    shakeCountMax: Math.round(duration / 25)
  });

  await waitFor(duration);
});

const bloom = useBloom(stage);
useVFX('bloomScreen', bloom.trigger);

const shockwave = useShockwave(
  stage,
  offset =>
    new Point(screen.value.width / 2 + offset.x, screen.value.height / 2 + offset.y)
);
useVFX('shockwaveOnScreenCenter', shockwave.trigger);
</script>

<template>
  <Sky />
  <Layer :group="diffuseGroup" />
  <Layer :group="normalGroup" />
  <Layer :group="lightGroup" />
  <Camera>
    <MapCell v-for="cell in cells" :key="cell.id" :cell="cell" />
    <Entity v-for="entity in entities" :key="entity.id" :entity-id="entity.id" />
    <SummonPreview />
    <AttackTargetArrows v-if="settings.ui.displayDangerArrows" />
  </Camera>

  <Tint />
  <graphics
    :alpha="vfxTint.alpha.value"
    event-mode="none"
    :blend-mode="vfxTint.blendMode.value"
    @render="
      g => {
        g.clear();
        g.beginFill(vfxTint.color.value);
        g.drawRect(0, 0, screen.width, screen.height);
        g.endFill();
      }
    "
  />
  <TargetingOverlay />
  <Layer :ref="(layer: any) => ui.registerLayer(layer, 'fx')" />
  <Layer :ref="(layer: any) => ui.registerLayer(layer, 'ui')" />

  <Fps v-if="isDev" />
</template>
