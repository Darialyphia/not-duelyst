<script setup lang="ts">
import { CARD_KINDS, type EntityId } from '@game/sdk';
import { AnimatedSprite, Container, Point, type Filter, type FrameObject } from 'pixi.js';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { match } from 'ts-pattern';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { OutlineFilter } from '@pixi/filter-outline';
import { COLOR_CODED_UNITS } from '~/utils/settings';
import { waitFor, type Nullable } from '@game/shared';

const { entityId, scaleX } = defineProps<{ entityId: EntityId; scaleX: number }>();

const { ui, fx, pathfinding, gameType, session } = useGame();
const entity = useEntity(entityId);
const { settings } = useUserSettings();
const userPlayer = useUserPlayer();

const sprite = ref<AnimatedSprite>();
const unitTextures = useEntityTexture(entityId, sprite);

const isSelected = computed(() => ui.selectedEntity.value?.equals(entity.value));
const isHovered = computed(() => ui.hoveredEntity.value?.equals(entity.value));

watchEffect(() => {
  fx.entityAnimationsMap.value.set(entityId, isSelected.value ? 'idle' : 'breathing');
});
const exhaustedFilter = new AdjustmentFilter({ saturation: 0.35 });
const selectedFilter = new OutlineFilter(1, 0xffffff);

const getPlayerFilterAlpha = () =>
  match(settings.value.a11y.colorCodeUnits)
    .with(COLOR_CODED_UNITS.OFF, () => 0)
    .with(COLOR_CODED_UNITS.SUBTLE, () => 0.08)
    .with(COLOR_CODED_UNITS.STRONG, () => 0.2)
    .exhaustive();

const A11Y_GREEN = 0x00ff00;
const A11Y_RED = 0xff0000;
const getPlayerFilterColor = () =>
  match(gameType.value)
    .with(GAME_TYPES.PVP, GAME_TYPES.SANDBOX, () =>
      userPlayer.value!.equals(entity.value.player) ? A11Y_GREEN : A11Y_RED
    )
    .with(GAME_TYPES.SPECTATOR, () =>
      entity.value.player.isPlayer1 ? A11Y_GREEN : A11Y_RED
    )
    .exhaustive();

const playerFilter = new ColorOverlayFilter(
  getPlayerFilterColor(),
  getPlayerFilterAlpha()
);

watchEffect(() => {
  gsap.to(selectedFilter, {
    duration: 0.3,
    thickness: isSelected.value ? 1 : 0,
    alpha: isSelected.value ? 1 : 0,
    ease: Power2.easeOut
  });
});

watchEffect(() => {
  playerFilter.alpha = getPlayerFilterAlpha();
  playerFilter.color = getPlayerFilterColor();
});

const attackTargetFilter = new OutlineFilter(2, 0xff0000);
const dangerFilter = new ColorOverlayFilter(0xff0000, 0.3);

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

  if (
    ui.selectedEntity.value &&
    ui.hoveredEntity.value?.isEnemy(ui.selectedEntity.value.id) &&
    ui.selectedEntity.value.canAttack(ui.hoveredEntity.value) &&
    ui.selectedEntity.value.attackPattern
      .getAffectedUnits(ui.hoveredEntity.value)
      .includes(entity.value) &&
    ui.targetingMode.value === TARGETING_MODES.BASIC
  ) {
    result.push(attackTargetFilter);
  }

  if (ui.targetingMode.value === TARGETING_MODES.BASIC) {
    if (
      settings.value.ui.displayDangerArrows &&
      ui.hoveredCell.value &&
      ui.selectedEntity.value &&
      !entity.value.player.equals(userPlayer.value) &&
      pathfinding.canMoveTo(ui.selectedEntity.value, ui.hoveredCell.value) &&
      pathfinding.canAttackAt(entity.value, ui.hoveredCell.value)
    ) {
      result.push(dangerFilter);
    }
  } else if (ui.targetingMode.value === TARGETING_MODES.SUMMON) {
    if (
      settings.value.ui.displayDangerArrows &&
      ui.hoveredCell.value &&
      !entity.value.player.equals(userPlayer.value) &&
      pathfinding.canAttackAt(entity.value, ui.hoveredCell.value)
    ) {
      result.push(dangerFilter);
    }
  }
  return result;
});

watch(sprite, newSprite => {
  fx.registerSprite(entityId, newSprite);
});

const castFxTextures = ref(null) as Ref<Nullable<FrameObject[]>>;
const cleanups = [
  session.on('card:before_played', async card => {
    if (!entity.value) return;
    if (!entity.value.isGeneral) return;
    if (!card.player.equals(entity.value.player)) return;
    if (card.kind !== CARD_KINDS.SPELL && card.kind !== CARD_KINDS.ARTIFACT) return;
    // const spritesheet = await assets.loadSpritesheet('use-skill');
    // castFxTextures.value = createSpritesheetFrameObject('default', spritesheet);
  }),
  session.on('card:after_played', () => {
    castFxTextures.value = null;
  })
];

onUnmounted(() => {
  cleanups.forEach(fn => fn());
});

const root = ref<Container>();
const shaker = useShaker(root);
useVFX('shakeEntity', async (e, { isBidirectional, amplitude, duration }) => {
  if (!e.equals(entity.value)) return;
  shaker.trigger({
    isBidirectional,
    shakeAmount: amplitude,
    shakeDelay: 25,
    shakeCountMax: Math.round(duration / 25)
  });

  await waitFor(duration);
});
const bloom = useBloom(root);
useVFX('bloomEntity', async (e, opts) => {
  if (e.equals(entity.value)) {
    await bloom.trigger(opts);
  }
});
const shockwave = useShockwave(
  root,
  offset => new Point(root.value!.x + offset.x, root.value!.y + offset.y)
);
useVFX('shockwaveOnEntity', async (e, opts) => {
  if (e.equals(entity.value)) {
    await shockwave.trigger(opts);
  }
});
</script>

<template>
  <container ref="root" :filters="filters">
    <EntityPedestal :entity-id="entityId" />
    <animated-sprite
      v-if="unitTextures"
      :ref="
        (el: AnimatedSprite) => {
          sprite = el;
        }
      "
      :scale-x="scaleX"
      :textures="unitTextures"
      :anchor-x="0.5"
      :anchor-y="1"
      :playing="true"
      :y="CELL_HEIGHT * 0.75"
    />
    <!-- <sprite
      :alpha="0.85"
      :texture="radialGradient(200, 200, 'rgb(255,0,0)', 'rgba(255,255,100,0)')"
      :anchor-x="0.5"
      :anchor-y="0.25"
      :blend-mode="1"
    /> -->

    <animated-sprite
      v-if="castFxTextures"
      :textures="castFxTextures"
      :anchor-x="0.5"
      :anchor-y="0"
      event-mode="none"
      loop
      playing
      :z-index="1"
      :y="-CELL_HEIGHT * 0.6"
    />
  </container>
</template>
