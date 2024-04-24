<script setup lang="ts">
import { OutlineFilter } from '@pixi/filter-outline';
import { FACTIONS, KEYWORDS, type EntityId } from '@game/sdk';
import { AnimatedSprite, type Filter } from 'pixi.js';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import IlluminatedSprite from '../IlluminatedSprite.vue';
import { match } from 'ts-pattern';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { ui, fx, camera } = useGame();
const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
const sprite = ref<AnimatedSprite>();
const { diffuseTextures, normalTextures } = useEntityTexture(entityId, sprite);

const isSelected = computed(() => ui.selectedEntity.value?.equals(entity.value));
const isHovered = computed(() => ui.hoveredEntity.value?.equals(entity.value));

watchEffect(() => {
  fx.entityAnimationsMap.value.set(entityId, isSelected.value ? 'idle' : 'breathing');
});

const exhaustedFilter = new AdjustmentFilter({ saturation: 0 });
const outlineFilter = new OutlineFilter(1, 0xffffff, 0.2, 0);

watchEffect(() => {
  // gsap.to(bloomFilter, {
  //   duration: 0.2,
  //   blur: isSelected.value ? 4 : 0,
  //   ease: Power2.easeOut
  // });
  gsap.to(outlineFilter, {
    duration: 0.3,
    alpha: isSelected.value || isHovered.value ? 1 : 0,
    ease: Power2.easeOut
  });
});

const filters = computed(() => {
  const result: Filter[] = [outlineFilter];

  if (entity.value.hasKeyword(KEYWORDS.EXHAUSTED)) {
    result.push(exhaustedFilter);
  }
  return result;
});

watch(sprite, newSprite => {
  fx.registerSprite(entityId, newSprite);
});

const lightColor = computed(() => {
  const faction = entity.value.player.general.card.blueprint.factions[0]!.id;
  return match(faction)
    .with(FACTIONS.F1.id, () => 0xffcc00)
    .with(FACTIONS.F2.id, () => 0xff6600)
    .with(FACTIONS.F3.id, () => 0x88aa00)
    .with(FACTIONS.F4.id, () => 0x770099)
    .with(FACTIONS.F5.id, () => 0x00ff77)
    .run();
});
const MIN_LIGHTNESS = 0.1;
const MAX_LIGHTNESS = 1;
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
</script>

<template>
  <container
    :ref="
      (el: any) => {
        const spriteInst = el?.children?.find(
          (child: any) => child instanceof AnimatedSprite
        );

        if (spriteInst) {
          sprite = spriteInst;
        }
      }
    "
  >
    <PointLight :color="lightColor" :brightness="lightBrightness" :x="0" :y="50" />

    <IlluminatedSprite
      v-if="diffuseTextures && normalTextures"
      :diffuse-textures="diffuseTextures"
      :normal-textures="normalTextures"
      :anchor-x="0.5"
      :anchor-y="0"
      :playing="true"
      :filters="filters"
      :y="-CELL_HEIGHT * 0.6"
      :is-flipped
    />
  </container>
</template>
