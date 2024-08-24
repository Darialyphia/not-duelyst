import type { AnyObject } from '@game/shared';
import type { Action, Filter } from '../card-effect';
import type { EffectCtx } from '../card-parser';
import {
  checkGlobalConditions,
  type GlobalCondition
} from '../conditions/global-conditions';
import { getUnits } from '../conditions/unit-conditions';
import { getPlayers } from '../conditions/player-condition';
import { getCards } from '../conditions/card-conditions';
import { getCells } from '../conditions/cell-conditions';
import { nanoid } from 'nanoid';
import { applyModifierConditionally } from '../helpers/actions';
import type { EntityModifier } from '../../modifier/entity-modifier';
import { getAmount } from '../helpers/amount';
import { getEquipedArtifact } from '../conditions/artifact-conditions';
import type { CardBlueprintId } from '../card';

export const noop = () => void 0;

export abstract class CardAction<T extends Action['type']> {
  constructor(
    protected action: Action & { type: T },
    protected ctx: EffectCtx,
    protected event: AnyObject,
    protected eventName?: string
  ) {}

  protected abstract executeImpl(): Promise<() => void>;

  protected generateModifierId() {
    return nanoid(6);
  }

  protected get session() {
    return this.ctx.session;
  }

  protected get card() {
    return this.ctx.card;
  }

  protected get targets() {
    return this.ctx.targets;
  }

  protected get entity() {
    return this.ctx.entity;
  }

  protected getAmount(amount: Parameters<typeof getAmount>[0]['amount']) {
    return getAmount({
      ...this.ctx,
      amount,
      event: this.event,
      eventName: this.eventName
    });
  }

  protected getBlueprint(blueprints: CardBlueprintId[]) {
    if (blueprints.length === 1) return blueprints[0]!;

    const idx = this.session.rngSystem.nextInt(blueprints.length - 1);
    return blueprints[idx]!;
  }

  protected getUnits(conditions: Parameters<typeof getUnits>[0]['conditions']) {
    return getUnits({
      ...this.ctx,
      conditions,
      event: this.event,
      eventName: this.eventName
    });
  }

  protected getPlayers(conditions: Parameters<typeof getPlayers>[0]['conditions']) {
    return getPlayers({
      ...this.ctx,
      conditions,
      event: this.event,
      eventName: this.eventName
    });
  }

  protected getCards(conditions: Parameters<typeof getCards>[0]['conditions']) {
    return getCards({
      ...this.ctx,
      conditions,
      event: this.event,
      eventName: this.eventName
    });
  }

  protected getCells(conditions: Parameters<typeof getCells>[0]['conditions']) {
    return getCells({
      ...this.ctx,
      conditions,
      event: this.event,
      eventName: this.eventName
    });
  }

  protected getEquipedArtifacts(
    conditions: Parameters<typeof getEquipedArtifact>[0]['conditions']
  ) {
    return getEquipedArtifact({
      ...this.ctx,
      conditions,
      event: this.event,
      eventName: this.eventName
    });
  }

  protected checkGlobalConditions(
    conditions: Parameters<typeof checkGlobalConditions>[0]
  ) {
    return checkGlobalConditions(conditions, this.ctx, this.event, this.eventName);
  }

  protected applyModifierConditionally(
    modifier: EntityModifier,
    conditions?: Filter<GlobalCondition>
  ) {
    const cleanup = applyModifierConditionally({
      modifier,
      ctx: this.ctx,
      event: this.event,
      eventName: this.eventName,
      session: this.ctx.session,
      conditions
    });

    if ('duration' in this.action.params) {
      if (this.action.params.duration === 'end_of_turn') {
        this.session.playerSystem.activePlayer.once('turn_end', () => {
          cleanup();
        });
      }
      if (this.action.params.duration === 'start_of_next_turn') {
        cleanup();
      }
    }
    return cleanup;
  }

  async execute(): Promise<() => void> {
    if ('filter' in this.action.params) {
      const isGlobalConditionMatch = this.checkGlobalConditions(
        this.action.params.filter
      );

      if (!isGlobalConditionMatch) return noop;
    }

    return this.executeWithDelay(this.action.params.execute);
  }

  private executeWithDelay(timing: Action['params']['execute']) {
    if (!timing || timing === 'now') return this.executeImpl();

    if (timing === 'end_of_turn') {
      const cleanups: Array<() => void> = [];
      this.ctx.card.player.once('turn_end', async () => {
        cleanups.push(await this.executeImpl());
      });

      return () => {
        cleanups.forEach(c => c());
      };
    }

    if (timing === 'start_of_next_turn') {
      const cleanups: Array<() => void> = [];
      this.ctx.card.player.once('turn_start', async () => {
        cleanups.push(await this.executeImpl());
      });

      return () => {
        cleanups.forEach(c => c());
      };
    }

    return noop;
  }
}
