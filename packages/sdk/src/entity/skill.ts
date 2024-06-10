import type { Point3D } from '@game/shared';
import { MULTICOLOR, type SkillBlueprint } from '../card/card-blueprint';
import type { GameSession } from '../game-session';
import type { Entity } from './entity';
import { Interceptable, type inferInterceptor } from '../utils/helpers';

export type SkillInterceptor = Skill['interceptors'];

export class Skill {
  currentCooldown: number;

  constructor(
    private session: GameSession,
    public blueprint: SkillBlueprint,
    public caster: Entity
  ) {
    this.currentCooldown = this.blueprint.initialCooldown;
  }

  protected interceptors = {
    cooldown: new Interceptable<number, Skill>(),
    canUse: new Interceptable<boolean, Skill>()
  };

  addInterceptor<T extends keyof SkillInterceptor>(
    key: T,
    interceptor: inferInterceptor<SkillInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof SkillInterceptor>(
    key: T,
    interceptor: inferInterceptor<SkillInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  get id() {
    return this.blueprint.id;
  }

  get name() {
    return this.blueprint.name;
  }

  get description() {
    return this.blueprint.description;
  }

  get minTargetCount() {
    return this.blueprint.minTargetCount;
  }

  get maxTargetCount() {
    return this.blueprint.maxTargetCount;
  }

  get cooldown(): number {
    return this.interceptors.cooldown.getValue(this.blueprint.cooldown, this);
  }

  private get hasCorrectRunes() {
    if (!this.blueprint.runes) return true;
    return Object.entries(this.blueprint.runes).every(([faction, count]) => {
      if (faction === MULTICOLOR) return this.caster.player.totalRunesCount >= count;
      return (
        this.caster.player.runes[faction as keyof typeof this.caster.player.runes] >=
        count
      );
    });
  }
  get canUse(): boolean {
    console.log(this.blueprint.id, this.hasCorrectRunes);
    const baseValue =
      this.currentCooldown === 0 &&
      this.hasCorrectRunes &&
      (this.blueprint.canUse?.({ session: this.session, skill: this }) ?? true);

    return this.interceptors.canUse.getValue(baseValue, this);
  }

  keywords() {
    return this.blueprint.keywords ?? [];
  }

  isTargetable(point: Point3D, castPoints: Point3D[]) {
    return this.blueprint.isTargetable(point, {
      session: this.session,
      skill: this,
      castPoints: castPoints
    });
  }

  isInAreaOfEffect(point: Point3D, castPoints: Point3D[]) {
    return this.blueprint.isInAreaOfEffect(point, {
      session: this.session,
      skill: this,
      castPoints: castPoints
    });
  }

  use(castPoints: Point3D[], blueprintFollowup: number[]) {
    this.currentCooldown = this.cooldown;
    const followups = this.blueprint.blueprintFollowup?.getChoices() ?? [];

    return this.blueprint.onUse({
      session: this.session,
      castPoints,
      skill: this,
      affectedCells: this.session.boardSystem.cells.filter(cell =>
        this.isInAreaOfEffect(cell, castPoints)
      ),
      blueprintFollowup: blueprintFollowup.map(idx => followups[idx])
    });
  }

  onTurnStart() {
    this.currentCooldown = Math.max(this.currentCooldown - 1, 0);
  }
}
