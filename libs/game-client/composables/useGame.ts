import { GameSession, type GameState } from '@hc/sdk';
import type {
  Point3D,
  UnitBlueprint,
  UnitId,
  EntityId,
  Skill,
  SkillId,
  Cell,
  FXContext
} from '@hc/sdk';
import type { Values, UnionToIntersection, Nullable } from '@hc/shared';
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
  fx: {
    viewport?: Viewport;
    spriteMap: Map<EntityId, MaybeRefOrGetter<AnimatedSprite | undefined>>;
  };
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession, emit: ShortEmits<GameEmits>) => {
  const assets = useAssetsProvider();
  const state = ref<GameState>(session.getState());
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
      selectedSummon: ref(null)
    },
    fx: {
      viewport: undefined,
      spriteMap: new Map()
    }
  };

  session.fxContext = {
    playAnimationOnce(
      entityId,
      animationName,
      { animationNameFallback = 'idle', framePercentage = 1 } = {}
    ) {
      return new Promise<void>(resolve => {
        const entity = session.entityManager.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(context.fx.spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }

        const sheet = assets.getSprite(entity.unitId, 'placeholder');
        const hasAnimation = !!sheet.animations[animationName];
        if (!hasAnimation) {
          console.warn(
            `FXContext: animation not found on sprite : ${animationName}. Using fallback ${animationNameFallback}`
          );
          return resolve();
        }

        sprite.textures = createSpritesheetFrameObject(
          hasAnimation ? animationName : animationNameFallback,
          sheet
        );
        sprite.loop = false;
        sprite.gotoAndPlay(0);

        sprite.onFrameChange = frame => {
          if (frame > sprite.totalFrames * framePercentage) {
            resolve();
            sprite.onFrameChange = undefined;
          }
        };

        sprite.onComplete = () => {
          sprite.textures = createSpritesheetFrameObject('idle', sheet);
          sprite.loop = true;
          sprite.gotoAndPlay(0);
          sprite.onComplete = undefined;
          sprite.onFrameChange = undefined;
          resolve();
        };

        if (framePercentage === 0) {
          resolve();
        }
      });
    },

    playAnimationUntil(entityId, animationName, { animationNameFallback = 'idle' } = {}) {
      const entity = session.entityManager.getEntityById(entityId);
      if (!entity) {
        console.warn(`FXContext: entity not found for entityId ${entityId}`);
        return () => {};
      }

      const sprite = toValue(context.fx.spriteMap.get(entityId));
      if (!sprite) {
        console.warn(`FXContext: sprite not found for entity ${entityId}`);
        return () => {};
      }

      const sheet = assets.getSprite(entity.unitId, 'placeholder');
      const hasAnimation = !!sheet.animations[animationName];
      if (!hasAnimation) {
        console.warn(
          `FXContext: animation not found on sprite : ${animationName}. Using fallback ${animationNameFallback}`
        );
        return () => {};
      }

      sprite.textures = createSpritesheetFrameObject(
        hasAnimation ? animationName : animationNameFallback,
        sheet
      );
      sprite.loop = true;
      sprite.gotoAndPlay(0);

      return () => {
        sprite.textures = createSpritesheetFrameObject('idle', sheet);
        sprite.loop = true;
        sprite.gotoAndPlay(0);
      };
    },

    moveEntity(entityId, point, duration) {
      return new Promise<void>(resolve => {
        // wwe are grabbing the entity from the reactive state instead of entityManager otherwise the movement won't be tracked
        const entity = state.value.entities.find(e => e.id === entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        entity.position.x = point.x;
        entity.position.y = point.y;
        entity.position.z = point.z;

        setTimeout(() => {
          resolve();
        }, duration);
      });
    }
  };

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
