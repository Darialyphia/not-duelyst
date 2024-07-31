import type { Cell, CellId } from '@game/sdk';

export type CellViewModel = {
  id: CellId;
  defaultRotation: 0 | 90 | 180 | 270;
  spriteId: string;
  getCell: () => Cell;
};

export const useCellViewModel = (cellId: CellId) => {
  const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);

  return computed<CellViewModel>(() => ({
    id: cell.value.id,
    defaultRotation: cell.value?.defaultRotation,
    spriteId: cell.value?.spriteId,
    getCell() {
      return cell.value;
    }
  }));
};
