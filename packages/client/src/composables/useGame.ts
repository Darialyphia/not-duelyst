import type {
  Values,
  UnionToIntersection,
  Point3D,
  Nullable,
  AnyObject
} from '@game/shared';
import type {
  ClientSession,
  EntityId,
  Player,
  PlayerId,
  SimulationResult,
  TutorialStep
} from '@game/sdk';
import type { AssetsContext } from './useAssets';
import type { IsoCameraContext } from './useIsoCamera';
import type { GameUiContext } from './useGameUi';
import type { PathfindingContext } from './usePathfinding';
import type { FxContext } from './useFx';
import { match } from 'ts-pattern';
import { debounce } from 'lodash-es';

type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  Values<{
    [K in keyof T]: (evt: K, ...args: T[K]) => void;
  }>
>;

export const GAME_TYPES = {
  PVP: 'pvp',
  SANDBOX: 'sandbox',
  SPECTATOR: 'spectator'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameEmits = {
  move: [{ entityId: EntityId; position: Point3D }];
  attack: [{ targetId: EntityId; entityId: EntityId }];
  endTurn: [];
  playCard: [
    {
      cardIndex: number;
      position?: Point3D;
      targets: Point3D[];
      choice: number;
    }
  ];
  replace: [
    {
      cardIndex: number;
    }
  ];
  surrender: [];
  mulligan: [{ cardIndices: number[]; playerId: string }];
  p1Emote: [string];
  p2Emote: [string];
  simulateAction: [
    {
      type: string;
      payload: AnyObject;
    }
  ];
};

export type GameContext = {
  camera: IsoCameraContext;
  assets: AssetsContext;
  session: ClientSession;
  ui: GameUiContext;
  pathfinding: PathfindingContext;
  dispatch: ShortEmits<GameEmits>;
  fx: FxContext;
  gameType: Ref<GameType>;
  playerId: PlayerId | null;
  p1Emote: Ref<Nullable<string>>;
  p2Emote: Ref<Nullable<string>>;
  currentTutorialStep: Ref<Nullable<TutorialStep>>;
  simulationResult: Ref<Nullable<SimulationResult>>;
  requestSimulation<T extends keyof GameEmits>(action: {
    type: T;
    payload: GameEmits[T][0];
  }): void;
  userPlayer: Ref<Player>;
  isActivePlayer: Ref<boolean>;
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = ({
  session,
  emit,
  playerId,
  gameType,
  p1Emote,
  p2Emote,
  simulationResult,
  currentTutorialStep
}: {
  session: ClientSession;
  emit: ShortEmits<GameEmits>;
  playerId: PlayerId | null;
  gameType: Ref<GameType>;
  p1Emote: Ref<Nullable<string>>;
  p2Emote: Ref<Nullable<string>>;
  simulationResult: Ref<Nullable<SimulationResult>>;
  currentTutorialStep: Ref<Nullable<TutorialStep>>;
}) => {
  const ui = useGameUiProvider(session);
  const camera = useIsoCameraProvider();
  const assets = useAssets();
  const pathfinding = usePathfindingProvider(session, ui);
  const fx = useFXProvider();

  session.on('*', () => {
    simulationResult.value = null;
  });
  onUnmounted(() => {
    session.removeAllListeners();
  });

  const [userPlayer, unsubUserPlayer] = createClientSessionRef(session => {
    return match(gameType.value)
      .with(
        GAME_TYPES.SANDBOX,
        GAME_TYPES.SPECTATOR,
        () => session.playerSystem.activePlayer
      )
      .with(GAME_TYPES.PVP, () => session.playerSystem.getPlayerById(playerId!)!)
      .exhaustive();
  })(session);

  const [isActivePlayer, unsubIsActivePlayer] = createClientSessionRef(session => {
    return match(gameType.value)
      .with(GAME_TYPES.SANDBOX, () => true)
      .with(GAME_TYPES.SPECTATOR, () => false)
      .with(GAME_TYPES.PVP, () => session.playerSystem.activePlayer.id === playerId)
      .exhaustive();
  })(session);

  onUnmounted(() => {
    unsubIsActivePlayer();
    unsubUserPlayer();
  });

  const ctx: GameContext = {
    playerId,
    gameType,
    camera,
    assets,
    session,
    ui,
    pathfinding,
    dispatch: emit,
    fx,
    p1Emote,
    p2Emote,
    currentTutorialStep,
    simulationResult,
    requestSimulation: debounce(action => {
      emit('simulateAction', action as any);
    }, 20),
    isActivePlayer,
    userPlayer
  };
  provide(GAME_INJECTION_KEY, ctx);

  return ctx;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);

export const useUserPlayer = () => {
  return useGame().userPlayer;
};

export const useIsActivePlayer = () => {
  return useGame().isActivePlayer;
};
