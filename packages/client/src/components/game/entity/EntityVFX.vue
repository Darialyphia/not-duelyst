<script setup lang="ts">
import { CARD_KINDS, KEYWORDS, type EntityId } from '@game/sdk';
import { isAxisAligned } from '@game/sdk/src/utils/targeting';
import { rad2Deg, randomInt, Vec3, waitFor, type Nullable } from '@game/shared';
import { type FrameObject } from 'pixi.js';
import { PTransition, EasePresets } from 'vue3-pixi';

const { entityId, scaleX } = defineProps<{ entityId: EntityId; scaleX: number }>();

const { session, assets, ui, camera } = useGame();
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

const silencedTextures = ref<FrameObject[]>();

watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet('silenced');
  silencedTextures.value = createSpritesheetFrameObject('default', spritesheet);
});

const blastTextures = ref<FrameObject[]>();
watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet('fx_f3_blast');
  blastTextures.value = createSpritesheetFrameObject('default', spritesheet);
});

const isBlastDisplayed = ref(false);
const blastAngle = ref(0);
session.on('entity:before_deal_damage', async e => {
  if (
    !entity.value ||
    !e.entity.equals(entity.value) ||
    !blastTextures.value ||
    !e.isBattleDamage ||
    !e.entity.hasKeyword(KEYWORDS.BLAST) ||
    !isAxisAligned(e.entity.position, e.target.position)
  ) {
    return;
  }

  if (!entity.value) return 0;
  const originIso = toIso(e.entity.position, camera.angle.value, session.boardSystem);
  const destIso = toIso(e.target.position, camera.angle.value, session.boardSystem);

  const origin = new Vec3(originIso.isoX, originIso.isoY, originIso.isoZ);
  const dest = new Vec3(destIso.isoX, destIso.isoY, destIso.isoZ);
  blastAngle.value = rad2Deg(Vec3.sub(dest, origin).angle());
  if (scaleX === -1) {
    blastAngle.value = (blastAngle.value + 180) % 360;
  }

  await waitFor(500);
  isBlastDisplayed.value = true;
  const duration = blastTextures.value?.reduce((total, frame) => total + frame.time, 0);
  await waitFor(duration);
  isBlastDisplayed.value = false;
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
    :duration="{ enter: 300, leave: 0 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
  >
    <animated-sprite
      v-if="silencedTextures && entity.isDispelled"
      :ref="(container: any) => ui.assignLayer(container, 'ui')"
      :textures="silencedTextures"
      :anchor-x="0.5"
      :anchor-y="0"
      event-mode="none"
      loop
      playing
      :z-index="1"
      :y="-CELL_HEIGHT * 0.6"
    />
  </PTransition>

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

  <animated-sprite
    v-if="blastTextures && isBlastDisplayed"
    :ref="(sprite: any) => ui.assignLayer(sprite, 'fx')"
    :textures="blastTextures"
    :anchor-x="0"
    :anchor-y="0"
    event-mode="none"
    playing
    loop
    :scale-x="scaleX"
    :angle="blastAngle"
    :y="-CELL_HEIGHT * 0.6"
  />
</template>
