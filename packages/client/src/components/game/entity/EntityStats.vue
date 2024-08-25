<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { TextStyle } from 'pixi.js';
import { match } from 'ts-pattern';
import { PTransition, EasePresets } from 'vue3-pixi';

const { ui, assets, session } = useGame();
const { entityId } = defineProps<{ entityId: EntityId }>();

const entity = useEntity(entityId);

const attackTextures = computed(() => {
  const sheet = assets.getSpritesheet('unit-attack');
  return createSpritesheetFrameObject('idle', sheet);
});

const hpTextures = computed(() => {
  const sheet = assets.getSpritesheet('unit-hp');
  return createSpritesheetFrameObject('idle', sheet);
});

const { settings } = useUserSettings();
const isDisplayed = computed(() => {
  return match(settings.value.ui.displayUnitsStats)
    .with(DISPLAY_UNITS_STATS.ALWAYS, () => true)
    .with(DISPLAY_UNITS_STATS.NEVER, () => false)
    .with(DISPLAY_UNITS_STATS.HOVER_ONLY, () => ui.hoveredEntity.value?.id === entityId)
    .exhaustive();
});

const getStatColor = (current: number, reference: number) =>
  current < reference ? 'red' : current > reference ? 0x12c943 : 'white';

const attackStyle = new TextStyle({
  fontSize: 30,
  align: 'center',
  fill: getStatColor(entity.value.attack, entity.value.card.blueprint.attack)
});

const hpStyle = new TextStyle({
  fontSize: 30,
  align: 'center',
  fill: getStatColor(entity.value.hp, entity.value.card.blueprint.maxHp)
});

watchEffect(() => {
  attackStyle.fill = getStatColor(
    entity.value.attack,
    entity.value.card.blueprint.attack
  );

  hpStyle.fill = getStatColor(entity.value.hp, entity.value.card.blueprint.maxHp);
});

const damageAmount = ref(0);
const healAmount = ref(0);
const cleanups = [
  session.on('entity:after_take_damage', event => {
    if (!event.entity.equals(entity.value)) return;
    damageAmount.value = event.amount;

    setTimeout(() => {
      damageAmount.value = 0;
    }, 1500);
  }),
  session.on('entity:after_heal', event => {
    if (!event.entity.equals(entity.value)) return;
    healAmount.value = event.amount;

    setTimeout(() => {
      healAmount.value = 0;
    }, 1500);
  })
];
onUnmounted(() => {
  cleanups.forEach(fn => fn());
});
</script>

<template>
  <container
    v-if="isDisplayed"
    :ref="(container: any) => ui.assignLayer(container, 'ui')"
    :y="CELL_HEIGHT * 0.7"
    :x="0"
    event-mode="none"
  >
    <animated-sprite :textures="attackTextures" :x="-10" :y="-5" :anchor="0.5">
      <pixi-text :style="attackStyle" :scale="0.25" :anchor="0.5" :y="-1">
        {{ entity.attack }}
      </pixi-text>
    </animated-sprite>

    <animated-sprite :textures="hpTextures" :x="10" :y="-5" :anchor="0.5">
      <pixi-text :style="hpStyle" :scale="0.25" :anchor="0.5" :y="-1">
        {{ Math.max(0, entity.hp) }}
      </pixi-text>
    </animated-sprite>
  </container>

  <PTransition
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ scale: 0, y: 20 }"
    :enter="{ scale: 0.25, y: 0, ease: EasePresets.easeOutCubic }"
    :leave="{ scale: 0, alpha: 0, ease: EasePresets.easeOutCubic }"
  >
    <pixi-text
      v-if="damageAmount"
      :style="{
        align: 'center',
        fill: '#ff0000',
        fontSize: 60,
        fontWeight: '900',
        strokeThickness: 8
      }"
      :scale="0.25"
      :anchor="{ x: 0.5, y: 1.5 }"
    >
      {{ damageAmount }}
    </pixi-text>
  </PTransition>

  <PTransition
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ scale: 0, y: 20 }"
    :enter="{ scale: 0.25, y: 0, ease: EasePresets.easeOutCubic }"
    :leave="{ scale: 0, alpha: 0, ease: EasePresets.easeOutCubic }"
  >
    <pixi-text
      v-if="healAmount"
      :style="{
        align: 'center',
        fill: '#00ff00',
        fontSize: 60,
        fontWeight: '900',
        strokeThickness: 8
      }"
      :scale="0.25"
      :anchor="{ x: 0.5, y: 1.5 }"
    >
      {{ healAmount }}
    </pixi-text>
  </PTransition>
</template>
