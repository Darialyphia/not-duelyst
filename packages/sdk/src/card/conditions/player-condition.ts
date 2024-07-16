import { match } from 'ts-pattern';
import type { GameSession } from '../../game-session';
import type { Player } from '../../player/player';
import type { Card } from '../card';
import type { Filter } from '../card-effect';

export type PlayerCondition =
  | { type: 'ally_player' }
  | { type: 'enemy_player' }
  | { type: 'any_player' };

export const getPlayers = ({
  session,
  card,
  conditions
}: {
  session: GameSession;
  card: Card;
  conditions: Filter<PlayerCondition>;
}): Player[] =>
  session.playerSystem.getList().filter(p => {
    return conditions.some(group => {
      return group.every(condition => {
        return match(condition)
          .with({ type: 'ally_player' }, () => card.player.equals(p))
          .with({ type: 'enemy_player' }, () => card.player.opponent.equals(p))
          .with({ type: 'any_player' }, () => true)
          .exhaustive();
      });
    });
  });
