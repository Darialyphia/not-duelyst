export type UseCase<TInput, TOutput> = {
  execute: (input: TInput) => Promise<TOutput>;
};
