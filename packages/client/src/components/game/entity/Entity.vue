<script setup lang="ts">
import type { EntityId } from '@game/sdk';
import { Container, Texture } from 'pixi.js';
import { PTransition } from 'vue3-pixi';
const { entityId } = defineProps<{ entityId: EntityId }>();

const { session, camera, ui, fx, assets } = useGame();
const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId)!);
const settings = useUserSettings();

const scaleX = computed(() => {
  let value = entity.value.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const isEnterAnimationDone = ref(false);
const onEnter = (container: Container) => {
  container.y = -40;
  container.alpha = 0;

  gsap.to(container, {
    y: 0,
    duration: 1,
    ease: Bounce.easeOut,
    onStart() {
      container.alpha = 1;
    },
    onComplete() {
      isEnterAnimationDone.value = true;
    }
  });
};
const onShadowEnter = (container: Container) => {
  container.scale.set(0);
  container.pivot.set(container.width / 2, container.height / 2);
  gsap.to(container.scale, {
    x: 1,
    y: 1,
    duration: 1,
    ease: Bounce.easeOut
  });
};

const keywordsWithSprite = computed(() =>
  entity.value.keywords.filter(keyword => {
    if (!keyword.spriteId) return false;
    if (keyword.stacks === 0) return false;
    return true;
  })
);

onMounted(() => {
  session.fxSystem.playSfxOnEntity(entity.value.id, {
    resourceName: 'fx_smoke2',
    animationName: 'smokeground',
    offset: { x: 0, y: 20 },
    delay: 200
  });
});

const isSkillFXDisplayed = ref(false);
const skillTextures = useIlluminatedTexture('use-skill', 'default');
const currentSkillIcon = ref<string | null>(null);
const currentSkillTexture = ref<Texture>();
watchEffect(async () => {
  if (currentSkillIcon.value) {
    currentSkillTexture.value = await assets.loadTexture(
      `icon-${currentSkillIcon.value}`
    );
  }
});
session.on('entity:before_use_skill', event => {
  if (!event.entity.equals(entity.value)) return;

  isSkillFXDisplayed.value = true;
  currentSkillIcon.value = event.skill.blueprint.iconId;
  setTimeout(() => {
    isSkillFXDisplayed.value = false;
    currentSkillIcon.value = null;
  }, 1500);
});

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <IsoPositioner
    v-if="entity && fx.entityPositionsMap.value.get(entityId)"
    :animated="!fx.isPlaying.value"
    v-bind="fx.entityPositionsMap.value.get(entityId)!"
    :z-index-offset="5"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT * 0.7
    }"
    event-mode="none"
  >
    <container
      :ref="
        (container: any) => {
          if (container?.parent) {
            fx.registerEntityRootContainer(entity.id, container.parent);
          }
        }
      "
    >
      <container :scale-x="scaleX">
        <PTransition v-if="settings.fx.shadows" appear @enter="onShadowEnter">
          <container>
            <EntityShadow :entity-id="entityId" />
          </container>
        </PTransition>

        <PTransition appear @enter="onEnter">
          <container>
            <EntitySprite :entity-id="entityId" />
          </container>
        </PTransition>
      </container>

      <EntityKeyword
        v-for="keyword in keywordsWithSprite"
        :key="keyword.id"
        :keyword="keyword"
      />

      <PTransition
        :duration="{ enter: 300, leave: 300 }"
        :before-enter="{ alpha: 0 }"
        :enter="{ alpha: 1 }"
        :leave="{ alpha: 0 }"
      >
        <container
          v-if="isSkillFXDisplayed && skillTextures.diffuse && skillTextures.normal"
          :ref="autoDestroyRef"
        >
          <IlluminatedSprite
            :diffuse-textures="skillTextures.diffuse"
            :normal-textures="skillTextures.normal"
            :anchor-x="0.5"
            :anchor-y="0"
            event-mode="none"
            loop
            playing
            :z-index="1"
            :y="-CELL_HEIGHT * 0.6"
          />
        </container>
      </PTransition>

      <PTransition
        :duration="{ enter: 300, leave: 300 }"
        :before-enter="{ alpha: 0, y: 15 }"
        :enter="{ alpha: 1, y: 0 }"
        :leave="{ alpha: 0 }"
      >
        <container
          v-if="isSkillFXDisplayed && currentSkillTexture"
          :ref="
            (container: any) => {
              if (container) {
                ui.assignLayer(container, 'ui');
                autoDestroyRef(container);
              }
            }
          "
        >
          <animated-sprite
            :textures="[currentSkillTexture]"
            :scale="0.5"
            :anchor-x="0.5"
            :anchor-y="0"
            event-mode="none"
            :z-index="1"
            :y="-CELL_HEIGHT"
          />
        </container>
      </PTransition>

      <EntityStats v-if="isEnterAnimationDone" :entity-id="entityId" />
    </container>
  </IsoPositioner>
</template>
