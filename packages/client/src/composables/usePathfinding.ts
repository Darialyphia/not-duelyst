import type { Entity, EntityId, GameSession } from '@game/sdk';
import type { DistanceMap } from '@game/sdk/src/board/pathfinding';
import { type Nullable, type Point3D, type Vec3 } from '@game/shared';
import type { GameUiContext } from './useGameUi';

export type PathfindingContext = {
  canMoveTo(entity: Entity, position: Point3D): boolean;
  getPath(entity: Entity, to: Point3D, maxDistance: number): Nullable<Vec3[]>;
  canAttackAt(entity: Entity, position: Point3D): boolean;
  movePath: ComputedRef<Nullable<Vec3[]>>;
};

const PATHFINDING_INJECTION_KEY = Symbol(
  'pathfinding'
) as InjectionKey<PathfindingContext>;

export const usePathfindingProvider = (session: GameSession, ui: GameUiContext) => {
  const cache = new Map<EntityId, DistanceMap>();

  session.on('*', () => {
    cache.clear();
  });

  const api: PathfindingContext = {
    movePath: computed(() => {
      if (!ui.hoveredCell.value) return null;
      if (ui.targetingMode.value !== TARGETING_MODES.BASIC) return null;
      if (!ui.selectedEntity.value) return null;

      return api.getPath(
        ui.selectedEntity.value,
        ui.hoveredCell.value,
        ui.selectedEntity.value.speed
      );
    }),
    getPath(entity, to, maxDistance) {
      return session.boardSystem.getPathTo(entity, to, maxDistance)?.path;
    },
    canMoveTo(entity, point) {
      if (!cache.has(entity.id)) {
        const dm = session.boardSystem.getDistanceMap(entity.position, entity.speed);
        if (!dm) return false;
        cache.set(entity.id, dm);
      }
      const distanceMap = cache.get(entity.id)!;

      return entity.canMove(distanceMap.get(point));
    },
    canAttackAt(entity, point) {
      if (!cache.has(entity.id)) {
        const dm = session.boardSystem.getDistanceMap(entity.position, entity.speed);
        if (!dm) return false;
        cache.set(entity.id, dm);
      }
      const distanceMap = cache.get(entity.id)!;
      const neighbors = session.boardSystem.getNeighborsDestinations(point);
      const canAttack = neighbors.some(
        neighbor =>
          entity.canMove(distanceMap.get(neighbor)) && entity.canAttackAt(point, neighbor)
      );
      return (
        entity.canMove(distanceMap.get(point)) || entity.canAttackAt(point) || canAttack
      );
    }
  };

  provide(PATHFINDING_INJECTION_KEY, api);

  return api;
};

export const usePathfinding = () => useSafeInject(PATHFINDING_INJECTION_KEY);
