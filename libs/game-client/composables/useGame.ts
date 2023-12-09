import { GameSession, type GameState } from '@hc/sdk';
import type { EntityId } from '@hc/sdk/src/entity/entity';
import type { SkillId } from '@hc/sdk/src/skill/skill-builder';
import type { Point3D } from '@hc/sdk/src/types';
import type { UnitId } from '@hc/sdk/src/units/unit-lookup';
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
  };
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession, emit: ShortEmits<GameEmits>) => {
  const assets = useAssetsProvider();
  const state = shallowRef<GameState>(session.getState());

  const unsub = session.subscribe(event => {
    state.value = session.getState();
  });

  onUnmounted(() => {
    unsub?.();
  });

  const context: GameContext = {
    state,
    gameSession: session,
    sendInput: emit,
    mapRotation: ref(0),
    assets,
    ui: {
      hoveredCell: ref(null)
    }
  };

  provide(GAME_INJECTION_KEY, context);

  return context;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);

export const useGameUi = () => useGame().ui;
