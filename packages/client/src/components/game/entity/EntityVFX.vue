<script setup lang="ts">
import { CARD_KINDS, type EntityId } from '@game/sdk';
import { randomInt, type Nullable } from '@game/shared';
import { type FrameObject } from 'pixi.js';
import { PTransition, EasePresets } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { session, assets } = useGame();
const entity = useEntity(entityId);

const keywordsWithSprite = computed(() => {
  const base = entity.value.keywords.filter(keyword => {
    if (!keyword.spriteId) return false;
    if (
      keyword.shouldDisplaySprite &&
      !keyword.shouldDisplaySprite(session, entity.value)
    ) {
      return false;
    }
    if (keyword.stacks === 0) return false;
    return true;
  });

  return base;
});

onMounted(() => {
  session.fxSystem.playSfxOnEntity(entity.value.id, {
    resourceName: 'fx_smoke2',
    animationName: 'smokeground',
    offset: { x: 0, y: 20 },
    delay: 200
  });
});

const playedCardTextures = ref(null) as Ref<Nullable<FrameObject[]>>;

useSessionEvent('entity:before_take_damage', ([event]) => {
  if (!event.entity.equals(entity.value)) return;
  const bloodFx = randomInt(4);
  session.fxSystem.playSfxOnEntity(event.entity.id, {
    resourceName: 'fx_bloodground',
    animationName: bloodFx <= 1 ? 'default' : `bloodground${bloodFx ? bloodFx : ''}`,
    offset: {
      x: 0,
      y: 20
    }
  });
});

useSessionEvent('card:before_played', async ([card]) => {
  if (!entity.value.isGeneral) return;
  if (!card.player.equals(entity.value.player)) return;
  if (card.kind !== CARD_KINDS.SPELL && card.kind !== CARD_KINDS.ARTIFACT) return;
  const spritesheet = await assets.loadSpritesheet(card.blueprint.spriteId);
  playedCardTextures.value = createSpritesheetFrameObject('active', spritesheet);
});

useSessionEvent('card:after_played', () => {
  playedCardTextures.value = null;
});
</script>

<template>
  <EntityKeyword
    v-for="keyword in keywordsWithSprite"
    :key="keyword.id"
    :keyword="keyword"
  />

  <PTransition
    appear
    :duration="{ enter: 300, leave: 200 }"
    :before-enter="{ alpha: 0, y: -CELL_HEIGHT * 0.5 }"
    :enter="{ alpha: 1, y: -CELL_HEIGHT * 1.25, ease: EasePresets.easeOutCubic }"
    :leave="{ scale: 0, y: -CELL_HEIGHT, alpha: 0, ease: EasePresets.easeOutCubic }"
  >
    <animated-sprite
      v-if="playedCardTextures"
      :textures="playedCardTextures"
      :anchor-x="0.5"
      :y="-CELL_HEIGHT * 1.15"
      playing
      @complete="playedCardTextures = null"
    />
  </PTransition>
</template>
