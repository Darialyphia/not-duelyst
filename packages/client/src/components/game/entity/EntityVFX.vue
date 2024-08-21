<script setup lang="ts">
import { type EntityId } from '@game/sdk';
import { randomInt, waitFor, type Point } from '@game/shared';
import { type FrameObject } from 'pixi.js';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { session, assets, ui } = useGame();
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
  setTimeout(() => {
    session.fxSystem.playSfxOnEntity(entity.value, {
      resourceName: 'fx_smoke2',
      animationName: 'smokeground',
      offset: { x: 0, y: 55 },
      duration: 500
    });
  }, 250);
});

useSessionEvent('entity:before_take_damage', ([event]) => {
  if (!event.entity.equals(entity.value)) return;
  const bloodFx = randomInt(4);
  session.fxSystem.playSfxOnEntity(event.entity, {
    resourceName: 'fx_bloodground',
    animationName: bloodFx <= 1 ? 'default' : `bloodground${bloodFx ? bloodFx : ''}`,
    offset: {
      x: 0,
      y: 20
    },
    duration: 500
  });
});

const VFXSprites = ref([]) as Ref<
  Array<{ textures: FrameObject[]; offset: Point; id: string }>
>;

useVFX(
  'playSfxOnEntity',
  async (e, { resourceName, animationName, offset, duration }) => {
    if (!entity.value) return;
    if (!e.equals(entity.value)) return;
    const spritesheet = await assets.loadSpritesheet(resourceName);
    const el = {
      textures: createSpritesheetFrameObject(animationName, spritesheet),
      offset,
      id: resourceName
    };
    VFXSprites.value.push(el);
    await waitFor(duration);
    VFXSprites.value.splice(VFXSprites.value.indexOf(el));
  }
);
</script>

<template>
  <EntityKeyword
    v-for="keyword in keywordsWithSprite"
    :key="keyword.id"
    :keyword="keyword"
  />
  <DispelVFX :entity-id="entityId" />
  <PlayedCardVFX :entity-id="entityId" />
  <BlastVFX :entity-id="entityId" />
  <animated-sprite
    v-for="element in VFXSprites"
    :key="element.id"
    :ref="
      (container: any) => {
        ui.assignLayer(container, 'fx');
      }
    "
    :textures="element.textures"
    :anchor-x="0.5"
    :anchor-y="0"
    event-mode="none"
    playing
    :x="element.offset.x"
    :y="-CELL_HEIGHT * 0.6 + element.offset.y"
    :loop="false"
    @complete="VFXSprites.splice(VFXSprites.indexOf(element, 1))"
  />
  <LightsVFX :entity-id="entityId" />
</template>
