import type { Animation, EntityId, GameSession } from '@game/sdk';
import type { FXSystem } from '@game/sdk/src/fx-system';
import { Container, type AnimatedSprite } from 'pixi.js';
import type { InjectionKey } from 'vue';
import type { GameUiContext } from './useGameUi';
import type { AnyFunction, Point3D } from '@game/shared';
import { displayText } from './fx/displayText';
import { shakeEntity } from './fx/shakeEntity';
import { moveEntity } from './fx/moveEntity';
import { displayDamageIndicator } from './fx/displayDamageIndicator';
import { attack } from './fx/attack';
import type { AssetsContext } from './useAssets';
import { playAnimationUntil } from './fx/playAnimationUntil';
import type { IsoCameraContext } from './useIsoCamera';
import { playAnimation } from './fx/playAnimation';
import { playSfxOnEntity } from './fx/playSfxOnEntity';
import { playSfxOnScreenCenter } from './fx/playSfxOnScreenCenter';
import { changeAmbientLightUntil } from './fx/changeAmbientLightUntil';
import { addLightOnEntityUntil } from './fx/addLightOnentityUntil';

export type FxContext = {
  isPlaying: Ref<boolean>;
  ctx: FXSystem;
  entityAnimationsMap: Ref<Map<EntityId, Animation>>;
  entityPositionsMap: Ref<Map<EntityId, Point3D>>;
  provideSession: (session: GameSession) => void;
  provideUi: (ui: GameUiContext) => void;
  provideAssets: (assets: AssetsContext) => void;
  provideCamera: (camera: IsoCameraContext) => void;
  registerSprite: (
    entityId: EntityId,
    sprite: MaybeRefOrGetter<AnimatedSprite | undefined>
  ) => void;
  registerEntityRootContainer: (entityId: EntityId, container: Container) => void;
  registerRoot: (container: Container) => void;
  getEntityRoot(entityId: EntityId): Container | null;
};

const FX_INJECTION_KEY = Symbol('fx') as InjectionKey<FxContext>;

export type FxCommand<T extends keyof FXSystem> = (
  ctx: {
    session: GameSession;
    ui: GameUiContext;
    assets: AssetsContext;
    spriteMap: Map<EntityId, MaybeRefOrGetter<AnimatedSprite | undefined>>;
    entityRootMap: Map<EntityId, Container>;
    entityPositionsMap: Ref<Map<EntityId, Point3D>>;
    entityAnimationsMap: Ref<Map<EntityId, Animation>>;
    sceneRoot: Container;
    camera: IsoCameraContext;
    done: () => void;
  },
  ...args: Parameters<FXSystem[T]>
) => ReturnType<FXSystem[T]> extends Promise<infer U> ? U : ReturnType<FXSystem[T]>;

export const useFXProvider = () => {
  const visibility = useDocumentVisibility();
  const isHidden = computed(() => visibility.value === 'hidden');
  const isPlaying = ref(false);
  const spriteMap = new Map<EntityId, MaybeRefOrGetter<AnimatedSprite | undefined>>();
  const entityRootMap = new Map<EntityId, Container>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sceneRoot: Container;

  const provided: {
    session: GameSession | null;
    ui: GameUiContext | null;
    assets: AssetsContext | null;
    camera: IsoCameraContext | null;
    entityAnimationsMap: Ref<Map<EntityId, Animation>>;
    entityPositionsMap: Ref<Map<EntityId, Point3D>>;
  } = {
    session: null,
    ui: null,
    assets: null,
    camera: null,
    entityAnimationsMap: ref(new Map()),
    entityPositionsMap: ref(new Map())
  };

  const ensureProvided = () => {
    if (
      !isDefined(provided.session || !isDefined(provided.ui)) ||
      !isDefined(provided.assets) ||
      !isDefined(provided.camera)
    ) {
      throw new Error('FX  Context has not received his necessary providers.');
    }

    return {
      session: provided.session!,
      ui: provided.ui!,
      assets: provided.assets!,
      camera: provided.camera!,
      entityAnimationsMap: provided.entityAnimationsMap,
      entityPositionsMap: provided.entityPositionsMap
    };
  };

  const executeAsyncCommand = <T extends AnyFunction>(cb: T) => {
    return new Promise<ReturnType<T>>(resolve => {
      if (isHidden.value) return Promise.resolve();
      const { session, ui, assets, camera, entityAnimationsMap, entityPositionsMap } =
        ensureProvided();
      isPlaying.value = true;

      return cb({
        session,
        ui,
        assets,
        camera,
        spriteMap,
        entityRootMap,
        sceneRoot,
        entityAnimationsMap,
        entityPositionsMap,
        done: (val: ReturnType<T>) => {
          nextTick(() => {
            isPlaying.value = false;
            resolve(val);
          });
        }
      });
    });
  };
  const executeCommand = <T extends AnyFunction>(cb: T) => {
    if (isHidden.value) return Promise.resolve();
    const { session, ui, assets, camera, entityAnimationsMap, entityPositionsMap } =
      ensureProvided();
    isPlaying.value = true;

    return cb({
      session,
      ui,
      assets,
      camera,
      spriteMap,
      entityRootMap,
      sceneRoot,
      entityAnimationsMap,
      entityPositionsMap,
      done: () => {
        nextTick(() => {
          isPlaying.value = false;
        });
      }
    });
  };

  const ctx: FXSystem = {
    fadeOutEntity() {
      return Promise.resolve();
    },
    displayText(...args) {
      return executeAsyncCommand(ctx => {
        displayText(ctx, ...args);
      });
    },
    displayDamageIndicator(...args) {
      return executeAsyncCommand(ctx => {
        displayDamageIndicator(ctx, ...args);
      });
    },
    moveEntity(...args) {
      return executeAsyncCommand(ctx => {
        moveEntity(ctx, ...args);
      });
    },
    shakeEntity(...args) {
      return executeAsyncCommand(ctx => {
        shakeEntity(ctx, ...args);
      });
    },
    attack(...args) {
      return executeAsyncCommand(ctx => {
        attack(ctx, ...args);
      });
    },
    playAnimationUntil(...args) {
      return executeCommand(ctx => {
        return playAnimationUntil(ctx, ...args);
      });
    },
    playAnimation(...args) {
      return executeAsyncCommand(ctx => {
        return playAnimation(ctx, ...args);
      });
    },
    playSfxOnEntity(...args) {
      return executeAsyncCommand(ctx => {
        return playSfxOnEntity(ctx, ...args);
      });
    },
    playSfxOnScreenCenter(...args) {
      return executeAsyncCommand(ctx => {
        return playSfxOnScreenCenter(ctx, ...args);
      });
    },
    changeAmbientLightUntil(...args) {
      return executeCommand(ctx => {
        return changeAmbientLightUntil(ctx, ...args);
      });
    },
    addLightOnEntityUntil(...args) {
      return executeCommand(ctx => {
        return addLightOnEntityUntil(ctx, ...args);
      });
    }
  };

  const api: FxContext = {
    ctx,
    isPlaying,
    entityAnimationsMap: provided.entityAnimationsMap,
    entityPositionsMap: provided.entityPositionsMap,
    provideSession(session) {
      provided.session = session;
      session.on('entity:created', entity => {
        provided.entityAnimationsMap.value.set(entity.id, 'breathing');
      });

      const updatePositions = () => {
        session.entitySystem.getList().forEach(entity => {
          provided.entityPositionsMap.value.set(entity.id, entity.position.serialize());
        });
      };
      session.on('*', updatePositions);
      updatePositions();
    },
    provideUi(ui) {
      provided.ui = ui;
    },
    provideAssets(assets) {
      provided.assets = assets;
    },
    provideCamera(camera) {
      provided.camera = camera;
    },
    registerSprite(entityId, sprite) {
      spriteMap.set(entityId, sprite);
    },
    registerEntityRootContainer(entityId, container) {
      entityRootMap.set(entityId, container);
    },
    registerRoot(container) {
      sceneRoot = container;
    },
    getEntityRoot(entityId) {
      return entityRootMap.get(entityId) ?? null;
    }
  };

  provide(FX_INJECTION_KEY, api);

  return api;
};

export const useFX = () => useSafeInject(FX_INJECTION_KEY);
