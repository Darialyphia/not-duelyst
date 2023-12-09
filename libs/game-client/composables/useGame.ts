import { GameSession, type GameState } from '@hc/sdk';
import type { EntityId } from '@hc/sdk/src/entity/entity';
import type { Skill, SkillId } from '@hc/sdk/src/skill/skill-builder';
import type { Point3D } from '@hc/sdk/src/types';
import type { UnitBlueprint, UnitId } from '@hc/sdk/src/units/unit-lookup';
import type { Values, UnionToIntersection, Nullable } from '@hc/shared';
import type { Cell } from '@hc/sdk/src/map/cell';

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
  };
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession, emit: ShortEmits<GameEmits>) => {
  const assets = useAssetsProvider();
  const state = shallowRef<GameState>(session.getState());
  const unsub = session.subscribe(event => {
    const newState = session.getState();
    state.value = newState;
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
    state: state,
    gameSession: session,
    sendInput: emit,
    mapRotation: ref(0),
    ui: {
      distanceMap,
      targetMode: ref(null),
      hoveredCell: ref(null),
      selectedSkill: ref(null),
      selectedSummon: ref(null)
    }
  };

  watchEffect(() => {
    if (context.ui.selectedSkill.value) {
      context.ui.targetMode.value = 'skill';
      context.ui.selectedSummon.value = null;
    } else if (context.ui.selectedSummon.value) {
      context.ui.targetMode.value = 'summon';
      context.ui.selectedSkill.value = null;
    }
  });

  watch(
    () => state.value.activeEntity.id,
    (newVal, oldVal) => {
      if (newVal === oldVal) return;
      context.ui.targetMode.value = null;
    }
  );
  provide(GAME_INJECTION_KEY, context);

  return context;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);

export const useGameUi = () => useGame().ui;
