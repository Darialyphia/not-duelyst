<script setup lang="ts">
import { CARD_KINDS, type EntityId } from '@game/sdk';
import { type Nullable } from '@game/shared';
import { type FrameObject } from 'pixi.js';
import { PTransition, EasePresets } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { assets } = useGame();
const entity = useEntity(entityId);

const playedCardTextures = ref(null) as Ref<Nullable<FrameObject[]>>;

useSessionEvent('card:before_played', async ([card]) => {
  if (!entity.value) return;
  if (!entity.value.isGeneral) return;
  if (!card.player.equals(entity.value.player)) return;
  if (card.kind !== CARD_KINDS.SPELL && card.kind !== CARD_KINDS.ARTIFACT) return;
  const spritesheet = await assets.loadSpritesheet(card.blueprint.spriteId);
  if (spritesheet.animations.active) {
    playedCardTextures.value = createSpritesheetFrameObject('active', spritesheet);
  }
});

useSessionEvent('card:after_played', () => {
  playedCardTextures.value = null;
});
</script>

<template>
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
      :loop="false"
      @complete="playedCardTextures = null"
    />
  </PTransition>
</template>
