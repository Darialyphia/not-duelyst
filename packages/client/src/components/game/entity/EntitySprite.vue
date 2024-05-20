<script setup lang="ts">
import { OutlineFilter } from '@pixi/filter-outline';
import { FACTIONS, KEYWORDS, type EntityId } from '@game/sdk';
import { AnimatedSprite, Container, type Filter } from 'pixi.js';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import IlluminatedSprite from '../IlluminatedSprite.vue';
import { match } from 'ts-pattern';
import type { Nullable } from '@game/shared';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { COLOR_CODED_UNITS } from '~/utils/settings';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { ui, fx, camera, gameType } = useGame();
const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const settings = useUserSettings();
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const userPlayer = useUserPlayer();
const sprite = ref<AnimatedSprite>();
const { diffuseTextures, normalTextures } = useEntityTexture(entityId, sprite);

const isSelected = computed(() => ui.selectedEntity.value?.equals(entity.value));
const isHovered = computed(() => ui.hoveredEntity.value?.equals(entity.value));

watchEffect(() => {
  fx.entityAnimationsMap.value.set(entityId, isSelected.value ? 'idle' : 'breathing');
});
const exhaustedFilter = new AdjustmentFilter({ saturation: 0.35 });
const selectedFilter = new AdjustmentFilter({});
const getPlayerFilterAlpha = () =>
  match(settings.value.a11y.colorCodeUnits)
    .with(COLOR_CODED_UNITS.OFF, () => 0)
    .with(COLOR_CODED_UNITS.SUBTLE, () => 0.08)
    .with(COLOR_CODED_UNITS.STRONG, () => 0.2)
    .exhaustive();

const playerFilter = new ColorOverlayFilter(
  match(gameType.value)
    .with(GAME_TYPES.PVP, GAME_TYPES.SANDBOX, () =>
      userPlayer.value!.equals(entity.value.player) ? 0x00ff00 : 0xff0000
    )
    .with(GAME_TYPES.SPECTATOR, () =>
      entity.value.player.isPlayer1 ? 0x00ff00 : 0xff0000
    )
    .exhaustive(),
  getPlayerFilterAlpha()
);

watchEffect(() => {
  gsap.to(selectedFilter, {
    duration: 0.3,
    blue: isSelected.value ? 1.6 : 1,
    gamma: isSelected.value ? 1.15 : 1,
    ease: Power2.easeOut
  });
});

watchEffect(() => {
  playerFilter.alpha = getPlayerFilterAlpha();
});

const filters = computed(() => {
  const result: Filter[] = [];
  if (entity.value.isExhausted) {
    result.push(exhaustedFilter);
  }
  if (isSelected.value || isHovered.value) {
    result.push(selectedFilter);
  }
  if (settings.value.a11y.colorCodeUnits !== COLOR_CODED_UNITS.OFF) {
    result.push(playerFilter);
  }
  return result;
});

watch(sprite, newSprite => {
  fx.registerSprite(entityId, newSprite);
});

const lightColor = computed(() => {
  const faction = entity.value.player.general.card.blueprint.factions[0]?.id;
  return match(faction)
    .with(FACTIONS.F1.id, () => 0x6df7b1)
    .with(FACTIONS.F2.id, () => 0xf92045)
    .with(FACTIONS.F3.id, () => 0x00b9ff)
    .with(FACTIONS.F4.id, () => 0xb63dbb)
    .with(FACTIONS.F5.id, () => 0xefcb3a)
    .with(undefined, () => 0xaaaaaa)
    .run();
});

const MIN_LIGHTNESS = 0;
const MAX_LIGHTNESS = 0.6;
const lightBrightness = ref(MIN_LIGHTNESS);

watchEffect(() => {
  const isAlly = activePlayer.value.equals(entity.value.player);
  gsap.to(lightBrightness, {
    duration: 0.3,
    value:
      isAlly && (isSelected.value || isHovered.value) ? MAX_LIGHTNESS : MIN_LIGHTNESS,
    ease: Power2.easeOut
  });
});

const isFlipped = computed(() => {
  let value = entity.value.player.isPlayer1 ? false : true;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value = !value;
  }

  return value;
});

const pedestalTextures = useIlluminatedTexture(
  () => entity.value.card.pedestalId,
  'idle'
);

const { isEnabled, diffuseRef, normalRef, normalFilter } = useIllumination<Container>();
</script>

<template>
  <container>
    <PointLight
      v-if="lightBrightness > 0"
      :color="lightColor"
      :brightness="lightBrightness"
      :x="0"
      :y="-30"
    />

    <container :ref="diffuseRef" :filters="filters">
      <animated-sprite
        v-if="pedestalTextures.diffuse"
        :textures="pedestalTextures.diffuse"
        :anchor-x="0.5"
        :anchor-y="0"
        :playing="true"
        :y="-CELL_HEIGHT * 0.6"
        :is-flipped="isFlipped"
      />

      <animated-sprite
        v-if="diffuseTextures"
        :ref="
          (el: AnimatedSprite) => {
            sprite = el;
          }
        "
        :textures="diffuseTextures"
        :anchor-x="0.5"
        :anchor-y="0"
        :playing="true"
        :y="-CELL_HEIGHT * 0.85"
        :is-flipped="isFlipped"
        :filters="filters"
      />
    </container>

    <container v-if="isEnabled" :ref="normalRef" :filters="[normalFilter]">
      <animated-sprite
        v-if="pedestalTextures.normal"
        :textures="pedestalTextures.normal"
        :anchor-x="0.5"
        :anchor-y="0"
        :playing="true"
        :y="-CELL_HEIGHT * 0.6"
        :is-flipped="isFlipped"
      />

      <animated-sprite
        v-if="normalTextures"
        :textures="normalTextures"
        :anchor-x="0.5"
        :anchor-y="0"
        :playing="true"
        :y="-CELL_HEIGHT * 0.8"
        :is-flipped="isFlipped"
        :filters="filters"
      />
    </container>
  </container>
</template>
