import type { Cell, CellId } from '@game/sdk';
import type { Tile } from '@game/sdk/src/tile/tile';
import type { Nullable, Vec3 } from '@game/shared';

export type CellViewModel = {
  id: CellId;
  defaultRotation: 0 | 90 | 180 | 270;
  spriteId: string;
  position: Vec3;
  tile: Nullable<Tile>;
  getCell: () => Cell;
};

const makeCellViewModel = (cell: Cell): CellViewModel => ({
  id: cell.id,
  defaultRotation: cell.defaultRotation,
  spriteId: cell.spriteId,
  position: cell.position,
  tile: cell.tile,
  getCell() {
    return cell;
  }
});

export const useCellsViewModels = () => {
  const { session } = useGame();
  const [cells, unsub] = createClientSessionRef(
    session => session.boardSystem.cells,
    [
      'entity:after_bounce',
      'entity:after_destroy',
      'entity:after_move',
      'entity:after_teleport',
      'entity:created',
      'scheduler:flushed'
    ]
  )(session);

  onUnmounted(unsub);

  return computed<CellViewModel[]>(() =>
    cells.value.map(cell => makeCellViewModel(cell))
  );
};
