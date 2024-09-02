import type { Cell, CellId, Entity, EntityId, GameSession } from '@game/sdk';
import type { DistanceMap } from '@game/sdk/src/board/pathfinding';
import { type Nullable, type Point3D, type Vec3 } from '@game/shared';
import type { GameUiContext } from './useGameUi';

export type PathfindingContext = {
  canMoveTo(entity: Entity, position: Point3D): boolean;
  getPath(entity: Entity, to: Point3D, maxDistance: number): Nullable<Vec3[]>;
  canAttackAt(entity: Entity, position: Point3D): boolean;
  canTarget(cell: Nullable<Cell>): boolean;
  movePath: ComputedRef<Nullable<Vec3[]>>;
};

const PATHFINDING_INJECTION_KEY = Symbol(
  'pathfinding'
) as InjectionKey<PathfindingContext>;

export const usePathfindingProvider = (session: GameSession, ui: GameUiContext) => {
  const cache = new Map<EntityId, DistanceMap>();
  const targetingCache = new Map<CellId, boolean>();

  session.on('scheduler:flushed', () => {
    cache.clear();
    targetingCache.clear();
  });
  watch(
    [ui.summonTarget, ui.cardTargets, ui.selectedCard],
    () => {
      targetingCache.clear();
    },
    { deep: true }
  );

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
      if (!entity) return false;
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
        const dm = session.boardSystem.getDistanceMap(
          entity.position,
          entity.speed * (entity.maxMovements - entity.movementsTaken)
        );
        if (!dm) return false;
        cache.set(entity.id, dm);
      }
      const distanceMap = cache.get(entity.id)!;
      const neighbors = session.boardSystem.getNeighborsDestinations(point);
      const canAttack = neighbors.some(neighbor => {
        return (
          entity.canMove(distanceMap.get(neighbor), { countAllMovements: true }) &&
          entity.canAttackAt(point, neighbor)
        );
      });
      return (
        entity.canMove(distanceMap.get(point)) || entity.canAttackAt(point) || canAttack
      );
    },
    canTarget(cellToTest) {
      if (!cellToTest) return false;
      if (!targetingCache.has(cellToTest.id)) {
        targetingCache.set(
          cellToTest.id,
          ui.selectedCard.value?.targets?.isTargetable(cellToTest, {
            session,
            playedPoint: ui.summonTarget.value ?? undefined,
            card: ui.selectedCard.value,
            targets: ui.cardTargets.value
          }) ?? false
        );
      }
      return targetingCache.get(cellToTest.id)!;
    }
  };

  provide(PATHFINDING_INJECTION_KEY, api);

  return api;
};

export const usePathfinding = () => useSafeInject(PATHFINDING_INJECTION_KEY);
