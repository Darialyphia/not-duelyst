import { GameSession, type GameState } from '@hc/sdk';
import type { EntityId } from '@hc/sdk/src/entity/entity';
import type { SkillId } from '@hc/sdk/src/skill/skill-builder';
import type { Point3D } from '@hc/sdk/src/types';
import type { UnitId } from '@hc/sdk/src/units/unit-lookup';
import type { Values, UnionToIntersection } from '@hc/shared';

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

type InputEmitter = ShortEmits<GameEmits>;

export type GameContext = {
  state: Ref<GameState>;
  gameSession: GameSession;
  sendInput: InputEmitter;
};
export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession, emit: InputEmitter) => {
  const state = shallowRef<GameState>(session.getState());

  const unsub = session.subscribe(event => {
    state.value = session.getState();
  });

  onUnmounted(() => {
    unsub?.();
  });

  const context = {
    state,
    gameSession: session,
    sendInput: emit
  };

  provide(GAME_INJECTION_KEY, context);

  return context;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
