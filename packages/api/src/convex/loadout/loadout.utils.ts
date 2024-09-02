import { CARD_KINDS, CARDS } from '@game/sdk';
import type { Doc, Id } from '../_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { CardBlueprintId } from '@game/sdk/src/card/card';
import { defaultFormat } from '../formats/format.utils';

export const ensureOwnsUnit = async (
  { db }: { db: MutationCtx['db'] },
  userId: Id<'users'>,
  unitId: string
) => {
  const exists = await db
    .query('collectionItems')
    .withIndex('by_item_id', q => q.eq('itemId', unitId))
    .filter(q => q.eq(q.field('ownerId'), userId));

  if (!exists) {
    throw new Error(`User does not own unit ${unitId}`);
  }
};

export const ensureCardExist = (cardId: string) => {
  const unit = CARDS[cardId];
  if (!unit) {
    throw new Error(`Unit not found: ${cardId}`);
  }

  return unit;
};

const ensureHasGeneral = (cards: Array<{ id: string }>) => {
  const isValid = cards.some(({ id }) => {
    const card = CARDS[id];
    return card.kind === CARD_KINDS.GENERAL;
  });

  if (!isValid) {
    throw new Error('Loadout does not have a general.');
  }
};

const ensureHasCorrectSize = (cards: Array<{ id: string }>) => {
  const isValid = cards.length === defaultFormat.config.MAX_DECK_SIZE + 1; //account for general

  if (!isValid) {
    throw new Error('Loadout does not have the correct size.');
  }
};

export const validateLoadout = async (
  { db }: { db: MutationCtx['db'] },
  {
    ownerId,
    cards,
    formatId
  }: {
    cards: Array<{ id: string; pedestalId: string; cardBackId: string }>;
    ownerId: Id<'users'>;
    formatId?: Id<'formats'>;
  }
): Promise<{
  cards: Array<{ id: CardBlueprintId; pedestalId: string; cardBackId: string }>;
  ownerId: Id<'users'>;
  formatId?: Id<'formats'>;
}> => {
  // const format = formatId ? await db.get(formatId) : defaultFormat;
  // if (!format) throw new Error('Format not found.');
  // const formatCards = JSON.parse(format!.cards) as Record<
  //   string,
  //   GenericSerializedBlueprint
  // >;
  // const violations = GameSession.getLoadoutViolations(
  //   cards.map(c => ({ ...c, blueprintId: c.id })),
  //   {
  //     config: format!.config,
  //     cards: formatCards
  //   }
  // );
  // if (violations.length)
  // throw new Error("This loadout doesn't respect the format constraints.");
  // await Promise.all(cards.map(card => ensureOwnsUnit({ db }, ownerId, card.id)));

  // ensureMaxCopies(cards.map(c => c.id));
  // ensureHasCorrectSize(cards);
  ensureHasGeneral(cards);

  return { cards, ownerId, formatId };
};

export const ensureLoadoutExists = async (
  { db }: { db: QueryCtx['db'] },
  loadoutId: Id<'loadouts'>
) => {
  const loadout = await db.get(loadoutId);
  if (!loadout) throw new Error(`Loadout not found: ${loadoutId}`);

  return loadout;
};

export const ensureOwnsLoadout = (loadout: Doc<'loadouts'>, userId: Id<'users'>) => {
  if (loadout.ownerId !== userId) {
    throw new Error('You do not have write access to this loadoug.');
  }
};
