import { GameSession, type GameState } from '@hc/sdk';
import type {
  Point3D,
  UnitBlueprint,
  UnitId,
  EntityId,
  Skill,
  SkillId,
  Cell,
  Player
} from '@hc/sdk';
import type { Values, UnionToIntersection, Nullable } from '@hc/shared';
import { Layer } from '@pixi/layers';
import type { Viewport } from 'pixi-viewport';
import type { AnimatedSprite } from 'pixi.js';

type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  Values<{
    [K in keyof T]: (evt: K, ...args: T[K]) => void;
  }>
>;

export type GameEmits = {
  move: [Point3D & { entityId: EntityId }];
  'end-turn': [];
  'use-skill': [{ skillId: SkillId; target: Point3D }];
  summon: [{ unitId: UnitId; position: Point3D }];
  end: [{ winner: Player }];
};

export type GameContext = {
  state: Ref<GameState>;
  gameSession: GameSession;
  sendInput: ShortEmits<GameEmits>;
  mapRotation: Ref<0 | 90 | 180 | 270>;
  assets: AssetsContext;
  ui: {
    hoveredCell: Ref<Nullable<Cell>>;
    distanceMap: ComputedRef<ReturnType<GameSession['map']['getDistanceMap']>>;
    targetMode: Ref<Nullable<'move' | 'skill' | 'summon'>>;
    selectedSkill: Ref<Nullable<Skill>>;
    selectedSummon: Ref<Nullable<UnitBlueprint>>;
    layers: {
      gameObjects: Ref<Layer | undefined>;
      ui: Ref<Layer | undefined>;
    };
  };
  fx: {
    isMoving: Ref<boolean>;
    viewport?: Viewport;
    spriteMap: Map<EntityId, MaybeRefOrGetter<AnimatedSprite | undefined>>;
  };
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession, emit: ShortEmits<GameEmits>) => {
  const assets = useAssetsProvider();
  const state = ref<GameState>(session.getState());
  const unsub = session.subscribe(action => {
    const newState = session.getState();
    state.value = newState;

    if (action.name === 'END_GAME') {
      emit('end', { winner: session.playerManager.getPlayerById(session.winner!)! });
    }
  });

  const distanceMap = computed(() => {
    return session.map.getDistanceMap(
      state.value.activeEntity.position,
      state.value.activeEntity.speed
    );
  });

  onUnmounted(() => {
    unsub?.();
  });

  const context: GameContext = {
    assets,
    state: state as Ref<GameState>,
    gameSession: session,
    sendInput: (type, payload?) => {
      // @ts-expect-error
      emit(type, payload);
      context.ui.targetMode.value = null;
      context.ui.selectedSkill.value = null;
      context.ui.selectedSummon.value = null;
    },
    mapRotation: ref(0),
    ui: {
      distanceMap,
      targetMode: ref(null),
      hoveredCell: ref(null),
      selectedSkill: ref(null),
      selectedSummon: ref(null),
      layers: {
        gameObjects: ref(),
        ui: ref()
      }
    },
    fx: {
      isMoving: ref(false),
      viewport: undefined,
      spriteMap: new Map()
    }
  };

  useInstallFxContext(context);

  watchEffect(() => {
    if (context.ui.selectedSkill.value) {
      context.ui.targetMode.value = 'skill';
      context.ui.selectedSummon.value = null;
    }
  });
  watchEffect(() => {
    if (context.ui.selectedSummon.value) {
      context.ui.targetMode.value = 'summon';
      context.ui.selectedSkill.value = null;
    }
  });
  watchEffect(() => {
    if (context.ui.targetMode.value === 'move') {
      context.ui.selectedSummon.value = null;
      context.ui.selectedSkill.value = null;
    }
  });

  provide(GAME_INJECTION_KEY, context);

  return context;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);

export const useGameUi = () => useGame().ui;
