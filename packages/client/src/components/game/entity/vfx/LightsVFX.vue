<script setup lang="ts">
import { type EntityId } from '@game/sdk';
import { waitFor, type Point } from '@game/shared';
import { BLEND_MODES } from 'pixi.js';
import { PTransitionGroup } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();
const entity = useEntity(entityId);

const { ui } = useGame();
let nextId = 1;

const lights = ref([]) as Ref<
  Array<{
    color: number;
    offset: Point;
    alpha: number;
    radius: number;
    id: number;
    blendMode: BLEND_MODES;
  }>
>;

useVFX(
  'addLightOnEntity',
  async (e, { color, alpha, radius, offset, blendMode, duration }) => {
    if (!entity.value) return;
    if (!e.equals(entity.value)) return;

    const el = {
      id: ++nextId,
      color,
      alpha,
      radius,
      offset,
      blendMode
    };
    lights.value.push(el);
    await waitFor(duration);
    lights.value.splice(lights.value.indexOf(el, 1));
  }
);
</script>

<template>
  <PTransitionGroup
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container v-for="light in lights" :key="light.id">
      <sprite
        :ref="(sprite: any) => ui.assignLayer(sprite, 'fx')"
        :alpha="light.alpha"
        :texture="
          radialGradient(light.radius * 2, light.radius * 2, [
            [0, `#${light.color.toString(16)}`],
            [0.9, 'rgba(255,255,100,0)']
          ])
        "
        :blend-mode="light.blendMode"
        :anchor-x="0.5"
        :anchor-y="0.25"
        :x="light.offset.x"
        :y="light.offset.y"
        :z-index="999"
        :z-order="999"
      />
    </container>
  </PTransitionGroup>
</template>
