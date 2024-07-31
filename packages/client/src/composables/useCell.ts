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

export const useCellViewModel = (cellId: CellId) => {
  const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

  return computed<CellViewModel>(() => makeCellViewModel(cell.value));
};

export const useCellsViewModels = () => {
  const cells = useGameSelector(session => session.boardSystem.cells);

  return computed<CellViewModel[]>(() =>
    cells.value.map(cell => makeCellViewModel(cell))
  );
};
