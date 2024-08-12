<script setup lang="ts">
import { Entity, KEYWORDS, type EntityId } from '@game/sdk';
import { isAxisAligned } from '@game/sdk/src/utils/targeting';
import { rad2Deg, Vec3, waitFor } from '@game/shared';
import { type FrameObject } from 'pixi.js';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { session, assets, ui, camera } = useGame();
const entity = useEntity(entityId);

const textures = ref<FrameObject[]>();
watchEffect(async () => {
  const spritesheet = await assets.loadSpritesheet('fx_f3_blast');
  textures.value = createSpritesheetFrameObject('default', spritesheet);
});

const isDisplayed = ref(false);
const isVertical = ref(false);
const scaleX = computed(() => {
  let value = entity.value.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});

const getAngle = (attacker: Entity, target: Entity) => {
  const originIso = toIso(attacker.position, camera.angle.value, session.boardSystem);
  const destIso = toIso(target.position, camera.angle.value, session.boardSystem);

  const origin = new Vec3(originIso.isoX, originIso.isoY, originIso.isoZ);
  const dest = new Vec3(destIso.isoX, destIso.isoY, destIso.isoZ);
  let angle = rad2Deg(Vec3.sub(dest, origin).angle());
  if (scaleX.value < 0) {
    angle = (angle + 180) % 360;
  }

  return angle;
};

const angle = ref(
  getAngle(entity.value.player.general, entity.value.player.opponent.general)
);

session.on('entity:before_deal_damage', async e => {
  const shouldBlast =
    entity.value &&
    e.entity.equals(entity.value) &&
    textures.value &&
    e.isBattleDamage &&
    e.entity.hasKeyword(KEYWORDS.BLAST) &&
    isAxisAligned(e.entity.position, e.target.position);

  if (!shouldBlast) return;

  angle.value = getAngle(e.entity, e.target);
  isVertical.value = e.entity.position.x === e.target.position.x;

  await waitFor(500);

  isDisplayed.value = true;
  const duration = textures.value!.reduce((total, frame) => total + frame.time, 0);

  await waitFor(duration);

  isDisplayed.value = false;
});
</script>

<template>
  <animated-sprite
    v-if="textures && isDisplayed"
    :ref="(sprite: any) => ui.assignLayer(sprite, 'fx')"
    :textures="textures"
    :anchor-x="0"
    :anchor-y="0"
    event-mode="none"
    playing
    loop
    :x="10"
    :scale-x="isVertical ? scaleX * 0.75 : scaleX"
    :angle="angle"
    :y="isVertical ? CELL_HEIGHT * 0.5 : -CELL_HEIGHT * 0.25"
  />
</template>
