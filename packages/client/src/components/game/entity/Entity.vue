<script setup lang="ts">
import { CARD_KINDS, type Entity, type EntityId } from '@game/sdk';
import { randomInt, type Nullable, type Point3D } from '@game/shared';
import { Container, type FrameObject } from 'pixi.js';
import { PTransition, EasePresets } from 'vue3-pixi';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { session, camera, fx, assets, ui, simulationResult } = useGame();
const entity = useEntity(entityId);
const { settings } = useUserSettings();

const position = ref(entity.value.position.serialize());
const isMoving = ref(false);

const move = (path: Point3D[]) => {
  isMoving.value = true;
  const timeline = gsap.timeline({
    onComplete() {
      isMoving.value = false;
    }
  });
  for (const point of path) {
    timeline.to(position.value, {
      ...point,
      duration: 0.4,
      // ease: Power0.easeNone
      ease: Power1.easeOut
    });
  }
  timeline.play();

  return timeline;
};

const shouldFlip = ref(false);
const scaleX = computed(() => {
  let value = entity.value.player.isPlayer1 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  if (shouldFlip.value) value *= -1;
  return value;
});
const checkFlip = ({ target, entity: attacker }: { target: Entity; entity: Entity }) => {
  if (!attacker.equals(entity.value)) return;
  if (target.position.x === entity.value.position.x) {
    shouldFlip.value = entity.value.player.isPlayer1;
  } else if (entity.value.player.isPlayer1) {
    shouldFlip.value = target.position.x < entity.value.position.x;
  } else {
    shouldFlip.value = target.position.x > entity.value.position.x;
  }
};

const boardDimensions = {
  width: session.boardSystem.width,
  height: session.boardSystem.height
};

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

const alpha = ref(1);
const playedCardTextures = ref(null) as Ref<Nullable<FrameObject[]>>;
const simulationDeathTexture = assets.getTexture('simulation-death.png');

const cleanups = [
  session.on('entity:before_move', event => {
    if (!event.entity.equals(entity.value)) return Promise.resolve();
    return new Promise<void>(resolve => {
      move(event.path).then(() => {
        resolve();
      });
    });
  }),
  session.on('entity:after_move', () => {
    position.value = entity.value.position.serialize();
  }),
  session.on('entity:after_teleport', () => {
    position.value = entity.value.position.serialize();
  }),
  session.on('entity:before_deal_damage', checkFlip),
  session.on('entity:after_attack', () => {
    shouldFlip.value = false;
  }),
  session.on('entity:before_destroy', event => {
    if (!event.equals(entity.value)) return;
    return new Promise(resolve => {
      gsap.to(alpha, {
        value: 0,
        duration: 1,
        ease: Power1.easeOut,
        onComplete: resolve
      });
    });
  }),
  session.on('entity:before_take_damage', event => {
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
  }),
  session.on('card:before_played', async card => {
    if (!entity.value.isGeneral) return;
    if (!card.player.equals(entity.value.player)) return;
    if (card.kind !== CARD_KINDS.SPELL && card.kind !== CARD_KINDS.ARTIFACT) return;
    const spritesheet = await assets.loadSpritesheet(card.blueprint.spriteId);
    playedCardTextures.value = createSpritesheetFrameObject('active', spritesheet);
  }),
  session.on('card:after_played', () => {
    playedCardTextures.value = null;
  })
];

onUnmounted(() => {
  cleanups.forEach(fn => fn());
});
</script>

<template>
  <IsoPositioner
    v-if="entity && fx.entityPositionsMap.value.get(entityId)"
    :animated="!isMoving"
    v-bind="position"
    :z-index-offset="2.5"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT * 0.65
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
      :alpha="alpha"
    >
      <container>
        <PTransition v-if="settings.fx.shadows" appear @enter="onShadowEnter">
          <container>
            <EntityShadow :entity-id="entityId" :scale-x="scaleX" />
          </container>
        </PTransition>

        <PTransition appear @enter="onEnter">
          <container>
            <EntityOrientationIndicator :entity-id="entityId" />
            <EntitySprite :entity-id="entityId" :scale-x="scaleX" />

            <template v-if="ui.isSimulationResultDisplayed.value && simulationResult">
              <pixi-text
                v-if="simulationResult.damageTaken[entity.id]"
                :anchor="0.5"
                :y="-10"
                :scale="0.25"
                :style="{
                  align: 'center',
                  fill: '#ff0000',
                  fontSize: 50,
                  fontWeight: '900',
                  strokeThickness: 6
                }"
              >
                - {{ simulationResult.damageTaken[entity.id] }}
              </pixi-text>
              <pixi-text
                v-if="simulationResult.healReceived[entity.id]"
                :anchor="0.5"
                :y="simulationResult.damageTaken[entity.id] ? -25 : -10"
                :scale="0.25"
                :style="{
                  align: 'center',
                  fill: '#00FF00',
                  fontSize: 50,
                  fontWeight: '900',
                  strokeThickness: 6
                }"
              >
                + {{ simulationResult.healReceived[entity.id] }}
              </pixi-text>
              <sprite
                v-if="simulationResult.deaths.includes(entity.id)"
                :texture="simulationDeathTexture"
                :anchor="0.5"
                :y="-12"
                :x="15"
              />
            </template>
          </container>
        </PTransition>
      </container>

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

      <EntityStats v-if="isEnterAnimationDone" :entity-id="entityId" />
    </container>
  </IsoPositioner>
</template>
