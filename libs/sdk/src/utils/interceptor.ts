import { AnyObject } from '@hc/shared';

export type Interceptor<
  TValue extends string | number | boolean,
  TContext extends AnyObject
> = (value: TValue, ctx: Readonly<TContext>) => TValue;

export const makeInterceptor = <
  TValue extends string | number | boolean,
  TContext extends AnyObject
>() => {
  const listeners: Interceptor<TValue, TContext>[] = [];

  return {
    add(interceptor: Interceptor<TValue, TContext>) {
      listeners.push(interceptor);
    },

    remove(interceptor: Interceptor<TValue, TContext>) {
      const idx = listeners.indexOf(interceptor);
      if (idx < 0) return;

      listeners.splice(listeners.indexOf(interceptor), 1);
    },

    getValue: (value: TValue, ctx: Readonly<TContext>) => {
      for (const listener of listeners) {
        value = listener(value, ctx);
      }

      return value;
    }
  };
};
