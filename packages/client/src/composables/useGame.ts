import type { Values, UnionToIntersection, Point3D } from '@game/shared';
import type { EntityId, GameSession, PlayerId } from '@game/sdk';
import type { AssetsContext } from './useAssets';
import type { IsoCameraContext } from './useIsoCamera';
import type { GameUiContext } from './useGameUi';
import type { PathfindingContext } from './usePathfinding';
import type { FxContext } from './useFx';
import { match } from 'ts-pattern';

type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  Values<{
    [K in keyof T]: (evt: K, ...args: T[K]) => void;
  }>
>;

export const GAME_TYPES = {
  PVP: 'pvp',
  SANDBOX: 'sandbox'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameEmits = {
  move: [{ entityId: EntityId; position: Point3D }];
  attack: [{ targetId: EntityId; entityId: EntityId }];
  endTurn: [];
  playCard: [{ cardIndex: number; position?: Point3D; targets?: Point3D[] }];
  useSkill: [{ skillIndex: number; entityId: EntityId; targets: Point3D[] }];
  // surrender: [];
  // summon: [{ unitId: UnitId; position: Point3D; targets: Point3D[] }];
  // end: [{ winner: Player }];
};

export type GameContext = {
  camera: IsoCameraContext;
  assets: AssetsContext;
  session: GameSession;
  ui: GameUiContext;
  pathfinding: PathfindingContext;
  dispatch: ShortEmits<GameEmits>;
  fx: FxContext;
  gameType: GameType;
  playerId: PlayerId | null;
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = ({
  session,
  emit,
  playerId,
  gameType
}: {
  session: GameSession;
  emit: ShortEmits<GameEmits>;
  playerId: PlayerId | null;
  gameType: GameType;
}) => {
  const ui = useGameUiProvider(session);
  const camera = useIsoCameraProvider();
  const assets = useAssetsProvider();
  const pathfinding = usePathfindingProvider(session);
  const fx = useFX();

  fx.provideSession(session);
  fx.provideUi(ui);
  fx.provideAssets(assets);
  fx.provideCamera(camera);

  onUnmounted(() => {
    session.removeAllListeners();
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
    fx
  };
  provide(GAME_INJECTION_KEY, ctx);

  return ctx;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);

export const useUserPlayer = () => {
  const { gameType, playerId } = useGame();

  return useGameSelector(session => {
    return match(gameType)
      .with(GAME_TYPES.SANDBOX, () => session.playerSystem.activePlayer)
      .with(GAME_TYPES.PVP, () => session.playerSystem.getPlayerById(playerId!))
      .exhaustive();
  });
};

export const useIsActivePlayer = () => {
  const { gameType, playerId } = useGame();

  return useGameSelector(session => {
    return match(gameType)
      .with(GAME_TYPES.SANDBOX, () => true)
      .with(GAME_TYPES.PVP, () => session.playerSystem.activePlayer.id === playerId)
      .exhaustive();
  });
};
