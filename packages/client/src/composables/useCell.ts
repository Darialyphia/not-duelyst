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

export const useCellViewModel = (cellId: CellId) => {
  const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

  return computed<CellViewModel>(() => ({
    id: cell.value.id,
    defaultRotation: cell.value?.defaultRotation,
    spriteId: cell.value?.spriteId,
    position: cell.value.position,
    tile: cell.value.tile,
    getCell() {
      return cell.value;
    }
  }));
};
