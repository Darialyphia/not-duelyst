import {
  CARD_KINDS,
  type Card,
  type Cell,
  type Entity,
  type EntityId,
  type GameSession
} from '@game/sdk';
import {
  isDefined,
  type Nullable,
  type Point,
  type Point3D,
  type Values
} from '@game/shared';
import type { Layer } from '@pixi/layers';
import type { DisplayObject } from 'pixi.js';
import { match } from 'ts-pattern';
import type { InjectionKey } from 'vue';

export const DEFAULT_MOUSE_LIGHT_STRENGTH = 0;
export const DEFAULT_MOUSE_LIGHT_COLOR = '#ffffff';

export const DEFAULT_AMBIENT_LIGHT_STRENGTH = 1;
export const DEFAULT_AMBIENT_LIGHT_COLOR = '#ffffff';

export const TARGETING_MODES = {
  NONE: 'NONE',
  BASIC: 'BASIC',
  SUMMON: 'SUMMON',
  TARGETING: 'TARGETING',
  CARD_CHOICE: 'CARD_CHOICE'
} as const;

type TargetingMode = Values<typeof TARGETING_MODES>;
type LayerName = 'ui' | 'scene' | 'fx';

export type GameUiContext = {
  isMenuOpened: Ref<boolean>;
  targetingMode: Ref<TargetingMode>;

  mousePosition: Ref<Point>;
  mouseLightColor: Ref<number | string>;

  mouseLightStrength: Ref<number>;

  ambientLightColor: Ref<number | string>;
  ambientLightStrength: Ref<number | string>;

  hoveredCell: ComputedRef<Nullable<Cell>>;
  hoveredEntity: ComputedRef<Nullable<Entity>>;
  hoverAt(point: Point3D): void;
  unhover(): void;

  selectedEntity: ComputedRef<Nullable<Entity>>;
  selectEntity(entityId: EntityId): void;
  unselectEntity(): void;

  highlightedCard: Ref<Nullable<Card>>;

  selectedCard: ComputedRef<Nullable<Card>>;
  selectedCardIndex: Ref<Nullable<number>>;

  cardChoice: Ref<Nullable<number>>;
  cardTargets: Ref<Point3D[]>;
  summonTarget: Ref<Nullable<Point3D>>;

  selectCardAtIndex(index: number): void;
  unselectCard(): void;

  switchTargetingMode(mode: TargetingMode): void;

  registerLayer(layer: Layer, name: LayerName): void;
  assignLayer(obj: Nullable<DisplayObject>, layer: LayerName): void;

  isSimulationResultDisplayed: Ref<boolean>;

  targetableCells: ComputedRef<Cell[]>;
  highlightableCells: ComputedRef<Cell[]>;
};

const GAME_UI_INJECTION_KEY = Symbol('game-ui') as InjectionKey<GameUiContext>;

export const useGameUiProvider = (session: GameSession) => {
  const hoveredPosition = ref<Nullable<Point3D>>(null);
  const highlightedCard = ref(null) as Ref<Nullable<Card>>;
  const selectedCardIndex = ref<Nullable<number>>(null);
  const selectedEntityId = ref<Nullable<EntityId>>(null);
  const cardTargets = ref<Point3D[]>([]);
  const summonTarget = ref<Nullable<Point3D>>();

  const targetingMode = ref<TargetingMode>(TARGETING_MODES.NONE);

  const layers: Record<LayerName, Ref<Layer | undefined>> = {
    ui: ref(),
    scene: ref(),
    fx: ref()
  };

  const ambientLightColor = ref(DEFAULT_AMBIENT_LIGHT_COLOR);
  const ambientLightStrength = ref(DEFAULT_AMBIENT_LIGHT_STRENGTH);

  const mouseLightColor = ref(DEFAULT_MOUSE_LIGHT_COLOR);
  const mouseLightStrength = ref(DEFAULT_MOUSE_LIGHT_STRENGTH);

  const api: GameUiContext = {
    isSimulationResultDisplayed: ref(false),
    isMenuOpened: ref(false),
    targetingMode,
    summonTarget,
    cardTargets,
    selectedCardIndex,
    ambientLightColor: computed({
      get() {
        return ambientLightColor.value;
      },
      set(val) {
        gsap.killTweensOf(ambientLightColor);
        gsap.to(ambientLightColor, {
          value: val,
          duration: 0.5,
          ease: Power2.easeOut
        });
      }
    }),
    ambientLightStrength: computed({
      get() {
        return ambientLightStrength.value;
      },
      set(val) {
        gsap.killTweensOf(ambientLightStrength);
        gsap.to(ambientLightStrength, {
          value: val,
          duration: 0.5,
          ease: Power2.easeOut
        });
      }
    }),
    mousePosition: ref({ x: 0, y: 0 }),
    mouseLightColor: computed({
      get() {
        return mouseLightColor.value;
      },
      set(val) {
        gsap.killTweensOf(mouseLightColor);
        gsap.to(mouseLightColor, {
          value: val,
          duration: 0.5,
          ease: Power2.easeOut
        });
      }
    }),
    mouseLightStrength: computed({
      get() {
        return mouseLightStrength.value;
      },
      set(val) {
        gsap.killTweensOf(mouseLightStrength);
        gsap.to(mouseLightStrength, {
          value: val,
          duration: 0.5,
          ease: Power2.easeOut
        });
      }
    }),
    switchTargetingMode(mode) {
      targetingMode.value = mode;
      api.mouseLightColor.value = DEFAULT_MOUSE_LIGHT_COLOR;
      api.ambientLightStrength.value =
        mode === TARGETING_MODES.TARGETING ? 0.6 : DEFAULT_AMBIENT_LIGHT_STRENGTH;
    },
    registerLayer(layer, name) {
      if (!layer) return;
      layers[name].value = layer;
      layer.group.enableSort = true;
      layer.sortableChildren = true;
    },
    assignLayer(obj, name) {
      if (!isDefined(obj)) return;
      obj.parentLayer = layers[name].value;
    },
    hoveredEntity: computed(() => {
      if (!hoveredPosition.value) return null;
      return session.entitySystem.getEntityAt(hoveredPosition.value);
    }),
    hoveredCell: computed(() => {
      if (!hoveredPosition.value) return null;
      return session.boardSystem.getCellAt(hoveredPosition.value);
    }),
    hoverAt(point) {
      hoveredPosition.value = point;
    },
    unhover() {
      hoveredPosition.value = null;
    },
    highlightedCard,
    selectedEntity: computed(() => {
      if (!selectedEntityId.value) return null;
      return session.entitySystem.getEntityById(selectedEntityId.value);
    }),
    selectEntity(entityId) {
      selectedEntityId.value = entityId;
      api.switchTargetingMode(TARGETING_MODES.BASIC);
      selectedCardIndex.value = null;
    },
    unselectEntity() {
      selectedEntityId.value = null;
      api.switchTargetingMode(TARGETING_MODES.NONE);
    },
    selectedCard: computed(() => {
      if (!isDefined(selectedCardIndex.value)) return null;
      return session.playerSystem.activePlayer.getCardFromHand(selectedCardIndex.value);
    }),
    selectCardAtIndex(index) {
      selectedCardIndex.value = index;
      selectedEntityId.value = null;
      match(api.selectedCard.value!.kind)
        .with(CARD_KINDS.GENERAL, CARD_KINDS.MINION, () => {
          api.switchTargetingMode(TARGETING_MODES.SUMMON);
        })
        .with(CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () => {
          api.switchTargetingMode(TARGETING_MODES.TARGETING);
        });
    },
    unselectCard() {
      selectedCardIndex.value = null;
      cardTargets.value = [];
      this.cardChoice.value = null;
      api.switchTargetingMode(TARGETING_MODES.NONE);
    },

    cardChoice: ref(null),

    targetableCells: computed(() => {
      if (!api.selectedCard.value) return [];
      if (!api.selectedCard.value.targets) return [];
      return api.selectedCard.value.targets.getAllTargets({
        session,
        playedPoint: api.summonTarget.value ?? undefined,
        card: api.selectedCard.value,
        targets: api.cardTargets.value
      });
    }),

    highlightableCells: computed(() => {
      if (!api.selectedCard.value) return [];
      if (!api.hoveredCell.value) return [];
      return api.selectedCard.value.blueprint.getHighlightedCells({
        session,
        playedPoint: api.summonTarget.value ?? undefined,
        targets: [
          ...api.cardTargets.value,
          api.targetableCells.value.some(c => api.hoveredCell.value?.equals(c))
            ? api.hoveredCell.value
            : null
        ].filter(isDefined),
        card: api.selectedCard.value!
      });
    })
  };
  provide(GAME_UI_INJECTION_KEY, api);

  session.on('player:turn_end', () => {
    api.unselectEntity();
    api.unselectCard();
  });
  return api;
};

export const useGameUi = () => useSafeInject(GAME_UI_INJECTION_KEY);
