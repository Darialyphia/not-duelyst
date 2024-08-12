import type { Animation, EntityId } from '@game/sdk';
import { Container, type AnimatedSprite } from 'pixi.js';
import type { InjectionKey } from 'vue';
import type { Point3D } from '@game/shared';
import type { CellId } from '@game/sdk/src/board/cell';

export type FxContext = {
  isPlaying: Ref<boolean>;
  entityAnimationsMap: Ref<Map<EntityId, Animation>>;
  entityPositionsMap: Ref<Map<EntityId, Point3D>>;
  entityRootMap: Map<EntityId, Container>;
  cellChildSpritesMap: Ref<Map<CellId, Array<string>>>;
  registerSprite: (
    entityId: EntityId,
    sprite: MaybeRefOrGetter<AnimatedSprite | undefined>
  ) => void;
  registerEntityRootContainer: (entityId: EntityId, container: Container) => void;
  registerRoot: (container: Container) => void;
  getEntityRoot(entityId: EntityId): Container | null;
};

const FX_INJECTION_KEY = Symbol('fx') as InjectionKey<FxContext>;

export const useFXProvider = () => {
  const isPlaying = ref(false);
  const spriteMap = new Map<EntityId, MaybeRefOrGetter<AnimatedSprite | undefined>>();
  const entityRootMap = new Map<EntityId, Container>();
  const cellChildSpritesMap = ref(new Map<CellId, Array<string>>());

  const entityAnimationsMap = ref(new Map());
  const entityPositionsMap = ref(new Map());

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sceneRoot: Container;

  const api: FxContext = {
    isPlaying,
    entityAnimationsMap,
    entityPositionsMap,
    entityRootMap,
    cellChildSpritesMap,

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
