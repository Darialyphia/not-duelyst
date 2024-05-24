<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { TextStyle } from 'pixi.js';
import { match } from 'ts-pattern';
import { PTransition, EasePresets } from 'vue3-pixi';

const { ui, assets } = useGame();
const { entityId } = defineProps<{ entityId: EntityId }>();

const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);

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
const attackStyle = new TextStyle({
  fontSize: 30,
  align: 'center',
  fill:
    entity.value.attack < entity.value.card.blueprint.attack
      ? 'red'
      : entity.value.attack > entity.value.card.blueprint.attack
        ? 0x12c943
        : 'white'
});

const hpStyle = new TextStyle({
  fontSize: 30,
  align: 'center',
  fill:
    entity.value.hp < entity.value.card.blueprint.maxHp
      ? 'red'
      : entity.value.hp > entity.value.card.blueprint.maxHp
        ? 0x12c943
        : 'white'
});

watchEffect(() => {
  attackStyle.fill =
    entity.value.attack < entity.value.card.blueprint.attack
      ? 'red'
      : entity.value.attack > entity.value.card.blueprint.attack
        ? 0x12c943
        : 'white';
  hpStyle.fill =
    entity.value.hp < entity.value.card.blueprint.maxHp
      ? 'red'
      : entity.value.hp > entity.value.card.blueprint.maxHp
        ? 0x12c943
        : 'white';
});

const attackDiff = ref<string | null>(null);
const maxHpDiff = ref<string | null>(null);
const currentHpDiff = ref<string | null>(null);
const currentHpDiffStyle = new TextStyle({
  fontSize: 34,
  align: 'center'
});

until(entity)
  .toBeTruthy()
  .then(() => {
    entity.value.on('after_take_damage', e => {
      currentHpDiff.value = `-${e.amount}`;
      currentHpDiffStyle.fill = 'red';
      setTimeout(() => {
        currentHpDiff.value = null;
      }, 1200);
    });

    entity.value.on('after_heal', e => {
      currentHpDiff.value = `+${e.amount}`;
      currentHpDiffStyle.fill = 'lime';
      setTimeout(() => {
        currentHpDiff.value = null;
      }, 1200);
    });
  });

watch(
  () => entity.value.attack,
  (newAttack, oldAttack) => {
    const diff = newAttack - oldAttack;
    attackDiff.value = `${diff > 0 ? '+' : ''}${diff}`;
    setTimeout(() => {
      attackDiff.value = null;
    }, 1200);
  }
);
watch(
  () => entity.value.maxHp,
  (newHp, oldHp) => {
    const diff = newHp - oldHp;
    maxHpDiff.value = `${diff > 0 ? '+' : ''}${diff}`;
    setTimeout(() => {
      maxHpDiff.value = null;
    }, 1200);
  }
);

const diffProps = {
  duration: { enter: 200, leave: 200 },
  beforeEnter: { scale: 0 },
  enter: { scale: 1, ease: EasePresets.easeOutCubic },
  leave: { scale: 0, ease: EasePresets.easeOutCubic }
};

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <container
    v-if="isDisplayed"
    :ref="(container: any) => ui.assignLayer(container, 'ui')"
    :y="CELL_HEIGHT * 0.7"
    :x="0"
    event-mode="none"
  >
    <animated-sprite :textures="attackTextures" :x="-28" :y="-5" :anchor="0.5">
      <pixi-text :style="attackStyle" :scale="0.25" :anchor="0.5" :y="-1">
        {{ entity.attack }}
      </pixi-text>
    </animated-sprite>

    <animated-sprite :textures="hpTextures" :x="28" :y="-5" :anchor="0.5">
      <pixi-text :style="hpStyle" :scale="0.25" :anchor="0.5" :y="-1">
        {{ Math.max(0, entity.hp) }}
      </pixi-text>
    </animated-sprite>
  </container>

  <container
    :ref="(container: any) => ui.assignLayer(container, 'ui')"
    :x="CELL_WIDTH * 0.15"
    :y="CELL_HEIGHT * 0.25"
    event-mode="none"
  >
    <PTransition v-bind="diffProps">
      <graphics
        v-if="attackDiff"
        :ref="(el: any) => autoDestroyRef(el)"
        :x="maxHpDiff ? -CELL_WIDTH * 0.3 : -CELL_WIDTH * 0.15"
        @render="
          g => {
            g.clear();
            g.beginFill('black');
            g.lineStyle({ color: 'yellow', width: 1 });
            g.drawCircle(0, 0, 10);
          }
        "
      >
        <pixi-text
          :style="{ fontSize: 34, align: 'center', fill: 'yellow' }"
          :scale="0.25"
          :x="0"
          :anchor="0.5"
        >
          {{ attackDiff }}
        </pixi-text>
      </graphics>
    </PTransition>

    <PTransition v-bind="diffProps">
      <graphics
        v-if="maxHpDiff"
        :ref="(el: any) => autoDestroyRef(el)"
        :x="attackDiff ? 0 : -CELL_WIDTH * 0.15"
        @render="
          g => {
            g.clear();
            g.beginFill('black');
            g.lineStyle({ color: 'red', width: 1 });
            g.drawCircle(0, 0, 10);
          }
        "
      >
        <pixi-text
          :style="{ fontSize: 34, align: 'center', fill: 'red' }"
          :scale="0.25"
          :anchor="0.5"
        >
          {{ maxHpDiff }}
        </pixi-text>
      </graphics>
    </PTransition>

    <PTransition v-bind="diffProps">
      <graphics
        v-if="currentHpDiff"
        :ref="(el: any) => autoDestroyRef(el)"
        :x="-CELL_WIDTH * 0.15"
        @render="
          g => {
            g.clear();
            g.beginFill('black');
            g.lineStyle({ color: currentHpDiffStyle.fill as any, width: 1 });
            g.drawCircle(0, 0, 10);
            g.endFill();
          }
        "
      >
        <pixi-text :style="currentHpDiffStyle" :scale="0.25" :anchor="0.5">
          {{ currentHpDiff }}
        </pixi-text>
      </graphics>
    </PTransition>
  </container>
</template>
