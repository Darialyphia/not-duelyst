<script setup lang="ts">
import { waitFor } from '@game/shared';
import { diffuseGroup, normalGroup, lightGroup } from '@pixi/lights';
import { BLEND_MODES, Point } from 'pixi.js';
import { onTick, useApplication, useScreen, useStage } from 'vue3-pixi';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import { ShockwaveFilter } from '@pixi/filter-shockwave';

const { ui, camera } = useGame();
const screen = useScreen();
const app = useApplication();

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
  gsap.to(vfxTint.alpha, { value: alpha, duration: 0.5 });
  gsap.to(vfxTint.color, { value: color, duration: 0.5 });
  vfxTint.blendMode.value = blendMode;

  await waitFor(duration);
  gsap.to(vfxTint.alpha, { value: 0, duration: 0.3 });
  gsap.to(vfxTint.color, { value: '#ffffff', duration: 0.3 });
  vfxTint.blendMode.value = BLEND_MODES.NORMAL;
});

const stage = useStage();
const shaker = useShaker();
shaker.setTarget(stage.value);
useVFX('shakeScreen', async ({ isBidirectional, amplitude, duration }) => {
  shaker.shake({
    isBidirectional,
    shakeAmount: amplitude,
    shakeDelay: 25,
    shakeCountMax: Math.round(duration / 25)
  });

  await waitFor(duration);
});

const bloom = new AdvancedBloomFilter();
bloom.brightness = 1;
useVFX('bloomScreen', async ({ strength, duration }) => {
  stage.value.filters ??= [];
  stage.value.filters.push(bloom);
  bloom.threshold = 0.9;
  bloom.bloomScale = 0;

  gsap.to(bloom, {
    threshold: 0.4,
    bloomScale: strength,
    duration: 0.4
  });
  bloom.threshold = 0.4;

  await waitFor(duration);
  gsap.to(bloom, {
    threshold: 0.9,
    bloomScale: 0,
    duration: 0.4,
    onComplete() {
      stage.value.filters?.splice(stage.value.filters.indexOf(bloom), 1);
    }
  });
});

const shockwave = new ShockwaveFilter();
shockwave.speed = 500;
shockwave.amplitude = 30;
shockwave.brightness = 1;
shockwave.center = new Point(screen.value.width / 2, screen.value.height / 2);

let shockwaveDuration = 2.5;
onTick(() => {
  shockwave.time += app.value.ticker.elapsedMS / 1000;
  shockwave.time %= shockwaveDuration;
});

useVFX('shockwaveOnScreenCenter', async ({ offset, duration, radius, wavelength }) => {
  shockwave.center = new Point(
    screen.value.width / 2 + offset.x,
    screen.value.height / 2 + offset.y
  );
  shockwave.wavelength = wavelength;
  shockwave.radius = radius * camera.viewport.value!.scale.x;

  shockwave.time = 0;
  shockwaveDuration = duration / 1000;

  stage.value.filters ??= [];
  stage.value.filters.push(shockwave);

  await waitFor(duration);
  stage.value.filters?.splice(stage.value.filters.indexOf(shockwave), 1);
});
</script>

<template>
  <Sky />
  <Layer :group="diffuseGroup" />
  <Layer :group="normalGroup" />
  <Layer :group="lightGroup" />
  <Camera>
    <AmbientLight
      :color="ui.ambientLightColor.value"
      :brightness="ui.ambientLightStrength.value"
    />

    <MapCell v-for="cell in cells" :key="cell.id" :cell="cell" />
    <Entity v-for="entity in entities" :key="entity.id" :entity-id="entity.id" />
    <SummonPreview />
    <AttackTargetArrows v-if="settings.ui.displayDangerArrows" />
    <PointLight
      v-if="ui.mouseLightStrength.value > 0"
      :brightness="ui.mouseLightStrength.value"
      :color="ui.mouseLightColor.value"
      :position="{ x: ui.mousePosition.value.x, y: ui.mousePosition.value.y - 50 }"
    />
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
