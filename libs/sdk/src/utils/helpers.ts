import { CellId } from '../map/cell';
import { Point3D } from '../types';

export const pointToCellId = (point: Point3D): CellId =>
  `${point.x}:${point.y}:${point.z}`;

export const cellIdToPoint = (cellId: CellId): Point3D => {
  const [x, y, z] = cellId.split(':').map(Number);

  return { x, y, z };
};

export const observableValue = <T>(value: T, onChange: (val: T) => void) => {
  const refObject = {
    get value() {
      return value;
    },
    set value(newValue) {
      value = newValue;
      onChange(this.value);
    }
  };
  return refObject;
};
