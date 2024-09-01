import type { CardBlueprintId } from '../card/card';
import { CARDS } from '../card/card-lookup';
import type { GameFormat, SerializedGameState } from '../game-session';

export const DECK_TOO_SMALL = "Deck doesn't have enough cards.";
export const DECK_TOO_BIG = 'Deck has too many cards.';
export const UNKNOWN_CARD = "Deck uses a card that doesn't belong to this format.";

export type LoadoutViolation =
  | {
      type: 'too_big';
      message: string;
    }
  | {
      type: 'too_small';
      message: string;
    }
  | {
      type: 'unknown_card';
      blueprintId: CardBlueprintId;
      message: string;
    }
  | {
      type: 'too_many_copies';
      blueprintId: string;
      message: string;
    };

export const validateLoadout = (
  loadout: SerializedGameState['players'][number]['deck'],
  format: GameFormat
) => {
  const formatCards = { ...CARDS, ...format.cards };
  const violations: LoadoutViolation[] = [];
  if (loadout.length < format.config.MAX_DECK_SIZE) {
    violations.push({
      type: 'too_small',
      message: 'Deck doesn\t have enough cards.'
    });
  }

  if (loadout.length > format.config.MAX_DECK_SIZE) {
    violations.push({ type: 'too_big', message: 'Deck has too many cards.' });
  }

  loadout.forEach(card => {
    const blueprint = formatCards[card.blueprintId];
    if (!blueprint) {
      violations.push({
        type: 'unknown_card',
        message: `Deck uses a card that doesn't belong to this format.`,
        blueprintId: card.blueprintId
      });
    }
    const copies = loadout.reduce((total, current) => {
      return current.blueprintId === card.blueprintId ? total + 1 : total;
    }, 0);
    if (copies > format.config.MAX_COPIES_PER_CARD) {
      const violation: LoadoutViolation = {
        type: 'too_many_copies',
        message: `Max copies exceeded for ${blueprint.name}`,
        blueprintId: card.blueprintId
      };
      if (violations.some(v => v.message === violation.message)) return;
      violations.push(violation);
    }
  });

  return [...new Set(violations)];
};
