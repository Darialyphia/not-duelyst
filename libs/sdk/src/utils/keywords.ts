export type KeywordContext = {
  atk: string;
  hp: string;
};

export type Keyword = {
  getName: (ctx: KeywordContext) => string;
  getDescription: (ctx: KeywordContext) => string;
};

export const KEYWORDS = {} satisfies Record<string, Keyword>;
