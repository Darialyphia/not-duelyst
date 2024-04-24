import type { AnyObject, Point3D } from '@game/shared';
import type { CellId } from '../board/cell';

export const pointToCellId = (point: Point3D): CellId =>
  `${point.x}:${point.y}:${point.z}`;

export const cellIdToPoint = (cellId: CellId): Point3D => {
  const [x, y, z] = cellId.split(':').map(Number);

  return { x, y, z };
};

export class ReactiveValue<T> {
  constructor(
    private internalValue: T,
    private onChange: (val: T) => void
  ) {}

  lazySetInitialValue(val: T) {
    this.internalValue = val;
  }

  get value() {
    return this.internalValue;
  }

  set value(newVal) {
    this.internalValue = newVal;
    this.onChange(this.internalValue);
  }
}

export type Interceptor<
  TValue extends string | number | boolean,
  TContext extends AnyObject
> = (value: Readonly<TValue>, ctx: Readonly<TContext>) => TValue;

export type inferInterceptor<T> =
  T extends Interceptable<infer Value, infer Ctx> ? Interceptor<Value, Ctx> : never;

export class Interceptable<
  TValue extends string | number | boolean,
  TContext extends AnyObject
> {
  listeners: { interceptor: Interceptor<TValue, TContext>; priority: number }[] = [];

  add(interceptor: Interceptor<TValue, TContext>, priority = 1) {
    this.listeners.push({ interceptor, priority });
  }

  remove(interceptor: Interceptor<TValue, TContext>) {
    const idx = this.listeners.findIndex(el => el.interceptor === interceptor);
    if (idx < 0) return;

    this.listeners.splice(idx, 1);
  }

  clear() {
    this.listeners = [];
  }

  getValue(initialValue: TValue, ctx: Readonly<TContext>) {
    return this.listeners
      .sort((a, b) => a.priority - b.priority)
      .reduce((value, listener) => listener.interceptor(value, ctx), initialValue);
  }
}
