import type { Values, UnionToIntersection, Point3D, Nullable } from '@game/shared';
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
      blueprintFollowup: number[];
    }
  ];
  useSkill: [
    {
      skillIndex: number;
      entityId: EntityId;
      targets: Point3D[];
      blueprintFollowup: number[];
    }
  ];
  surrender: [];
  draw: [];
  addRune: [{ factionId: string }];
  p1Emote: [string];
  p2Emote: [string];
};

export type GameContext = {
  camera: IsoCameraContext;
  assets: AssetsContext;
  session: GameSession;
  ui: GameUiContext;
  pathfinding: PathfindingContext;
  dispatch: ShortEmits<GameEmits>;
  fx: FxContext;
  gameType: Ref<GameType>;
  playerId: PlayerId | null;
  p1Emote: Ref<Nullable<string>>;
  p2Emote: Ref<Nullable<string>>;
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = ({
  session,
  emit,
  playerId,
  gameType,
  p1Emote,
  p2Emote
}: {
  session: GameSession;
  emit: ShortEmits<GameEmits>;
  playerId: PlayerId | null;
  gameType: Ref<GameType>;
  p1Emote: Ref<Nullable<string>>;
  p2Emote: Ref<Nullable<string>>;
}) => {
  const ui = useGameUiProvider(session);
  const camera = useIsoCameraProvider();
  const assets = useAssets();
  const pathfinding = usePathfindingProvider(session, ui);
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
    fx,
    p1Emote,
    p2Emote
  };
  provide(GAME_INJECTION_KEY, ctx);

  return ctx;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);

export const useUserPlayer = () => {
  const { gameType, playerId } = useGame();

  return useGameSelector(session => {
    return match(gameType.value)
      .with(
        GAME_TYPES.SANDBOX,
        GAME_TYPES.SPECTATOR,
        () => session.playerSystem.activePlayer
      )
      .with(GAME_TYPES.PVP, () => session.playerSystem.getPlayerById(playerId!)!)
      .exhaustive();
  });
};

export const useIsActivePlayer = () => {
  const { gameType, playerId } = useGame();

  return useGameSelector(session => {
    return match(gameType.value)
      .with(GAME_TYPES.SANDBOX, () => true)
      .with(GAME_TYPES.SPECTATOR, () => false)
      .with(GAME_TYPES.PVP, () => session.playerSystem.activePlayer.id === playerId)
      .exhaustive();
  });
};
