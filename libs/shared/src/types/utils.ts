export type Nullable<T> = T | null | undefined;
export type NonNullable<T> = Exclude<T, undefined | null>;
export type PartialBy<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type Boundaries<T = number> = { min: T; max: T };
export type Range = Boundaries<number>;
export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T];
export type Matrix<T> = T[][];
export type AnyObject = { [key: string]: any };
export type AnyFunction = (...args: any[]) => any;
export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];
export type Override<A, B> = Omit<A, keyof B> & B;
export type Mutable<T> = { -readonly [Key in keyof T]: T[Key] };
export type Constructor<T = AnyObject> = new (...args: any[]) => T;
export type AnyConstructor = Constructor<AnyObject>;
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
export type MaybePromise<T> = T | Promise<T>;
export type Iterableify<T> = { [K in keyof T]: Iterable<T[K]> };
export type Defined<T> = Exclude<T, undefined | null>;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
export type Intersect<X extends any[]> = X extends []
  ? never
  : X extends [head: infer A]
  ? A
  : X extends [head: infer A, ...tail: infer B]
  ? A & Intersect<[...B]>
  : never;

export type ApiError = {
  message: string;
  statusCode: number;
  meta: Nullable<AnyObject>;
};

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type DeepWriteable<T> = {
  -readonly [P in keyof T]: DeepWriteable<T[P]>;
};
export type Cast<X, Y> = X extends Y ? X : Y;
type FromEntries<T> = T extends [infer Key, any][]
  ? { [K in Cast<Key, string>]: Extract<ArrayElement<T>, [K, any]>[1] }
  : { [key in string]: any };
export type FromEntriesWithReadOnly<T> = FromEntries<DeepWriteable<T>>;

export type ToString<T extends PropertyKey> = T extends `${infer U extends
  string}`
  ? U
  : never;

export type UnionToIntersection<T> = (
  T extends T ? (p: T) => void : never
) extends (p: infer U) => void
  ? U
  : never;

export type Flatten<T> = {} & {
  [P in keyof T]: T[P];
};
