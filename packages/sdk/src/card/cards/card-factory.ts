import { match } from 'ts-pattern';
import type { GameSession } from '../../game-session';
import type { SerializedCard } from '../card';
import type { CardIndex, PlayerId } from '../../player/player';
import { CARD_KINDS } from '../card-enums';
import { Unit } from '../unit';
import { Spell } from '../spell';
import { Artifact } from '../artifact';

export const createCard = (
  session: GameSession,
  options: SerializedCard,
  index: CardIndex,
  playerId: PlayerId
) => {
  const blueprint = session.cardBlueprints[options.blueprintId];
  const card = match(blueprint.kind)
    .with(
      CARD_KINDS.GENERAL,
      CARD_KINDS.MINION,
      () => new Unit(session, index, options, playerId)
    )
    .with(CARD_KINDS.SPELL, () => new Spell(session, index, options, playerId))
    .with(CARD_KINDS.ARTIFACT, () => new Artifact(session, index, options, playerId))
    .exhaustive();
  card.setup();

  return card;
};
