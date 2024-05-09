import { type Serializable, Vec3, type Values } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Point3D } from '../types';
import EventEmitter from 'eventemitter3';
import type { CardIndex, PlayerId } from '../player/player';
import { Interceptable, ReactiveValue, type inferInterceptor } from '../utils/helpers';
import { isAlly, isEnemy } from './entity-utils';
import { isWithinCells } from '../utils/targeting';
import { type EntityModifier, type ModifierId } from '../modifier/entity-modifier';
import { CARD_KINDS } from '../card/card-utils';
import { type Keyword } from '../utils/keywords';
import { Tile } from '../tile/tile';
import { Skill } from './skill';

export type EntityId = number;

export type SerializedEntity = {
  id: number;
  position: Point3D;
  cardIndex: CardIndex;
  playerId: PlayerId;
  hp?: number;
};

export const ENTITY_EVENTS = {
  CREATED: 'created',

  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy',

  BEFORE_MOVE: 'before-move',
  AFTER_MOVE: 'after-move',

  BEFORE_DEAL_DAMAGE: 'before_deal_damage',
  AFTER_DEAL_DAMAGE: 'after_deal_damage',

  BEFORE_TAKE_DAMAGE: 'before_take_damage',
  AFTER_TAKE_DAMAGE: 'after_take_damage',

  BEFORE_HEAL: 'before_heal',
  AFTER_HEAL: 'after_heal',

  BEFORE_ATTACK: 'before_attack',
  AFTER_ATTACK: 'after_attack',

  BEFORE_USE_SKILL: 'before_use_skill',
  AFTER_USE_SKILL: 'after_use_skill'
} as const;

export type EntityEvent = Values<typeof ENTITY_EVENTS>;

type DealDamageEvent = {
  entity: Entity;
  target: Entity;
  amount: number;
};
type TakeDamageEvent = {
  entity: Entity;
  source: Entity;
  amount: number;
};
type AttackEvent = {
  entity: Entity;
  target: Entity;
};
type UseSkillEvent = {
  entity: Entity;
  skill: Skill;
  castPoints: Point3D[];
};

export type EntityEventMap = {
  [ENTITY_EVENTS.CREATED]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_DESTROY]: [entity: Entity];
  [ENTITY_EVENTS.AFTER_DESTROY]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_MOVE]: [entity: Entity];
  [ENTITY_EVENTS.AFTER_MOVE]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_DEAL_DAMAGE]: [event: DealDamageEvent];
  [ENTITY_EVENTS.AFTER_DEAL_DAMAGE]: [event: DealDamageEvent];

  [ENTITY_EVENTS.BEFORE_TAKE_DAMAGE]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_TAKE_DAMAGE]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.BEFORE_HEAL]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_HEAL]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.BEFORE_ATTACK]: [event: AttackEvent];
  [ENTITY_EVENTS.AFTER_ATTACK]: [event: AttackEvent];

  [ENTITY_EVENTS.BEFORE_USE_SKILL]: [event: UseSkillEvent];
  [ENTITY_EVENTS.AFTER_USE_SKILL]: [event: UseSkillEvent];
};

export type EntityInterceptor = Entity['interceptors'];

export class Entity extends EventEmitter<EntityEventMap> implements Serializable {
  private cardIndex: CardIndex;

  private playerId: PlayerId;

  readonly id: EntityId;

  readonly skills: Skill[];

  modifiers: EntityModifier[] = [];

  position: Vec3;

  private movementsTaken: number;
  private attacksTaken: number;
  private retaliationsDone: number;
  private skillsUsed: number;

  private currentHp = new ReactiveValue(0, hp => {
    const intercepted = this.interceptors.maxHp.getValue(hp, this);
    if (intercepted <= 0) {
      this.session.actionSystem.schedule(() => {
        this.destroy();
      });
    }
  });

  public isExhausted = false;

  private interceptors = {
    attack: new Interceptable<number, Entity>(),
    maxHp: new Interceptable<number, Entity>(),
    speed: new Interceptable<number, Entity>(),
    range: new Interceptable<number, Entity>(),
    canMove: new Interceptable<boolean, Entity>(),
    canAttack: new Interceptable<boolean, { entity: Entity; target: Entity }>(),
    canRetaliate: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    canBeAttackTarget: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    canUseSkill: new Interceptable<boolean, { entity: Entity; skill: Skill }>(),
    canBeSkillTarget: new Interceptable<boolean, { entity: Entity; skill: Skill }>(),
    damageTaken: new Interceptable<number, { entity: Entity; amount: number }>(),
    healReceived: new Interceptable<number, { entity: Entity; amount: number }>()
  };

  constructor(
    protected session: GameSession,
    options: SerializedEntity
  ) {
    super();
    this.id = options.id;
    this.position = Vec3.fromPoint3D(options.position);
    this.cardIndex = options.cardIndex;
    this.playerId = options.playerId;
    this.movementsTaken = 0;
    this.attacksTaken = 0;
    this.skillsUsed = 0;
    this.retaliationsDone = 0;
    this.skills = this.card.blueprint.skills.map(
      blueprint => new Skill(this.session, blueprint, this)
    );
    this.currentHp.lazySetInitialValue(options.hp ?? this.maxHp);
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  serialize(): SerializedEntity {
    return {
      id: this.id,
      position: this.position.serialize(),
      cardIndex: this.cardIndex,
      playerId: this.playerId,
      hp: this.hp
    };
  }

  get isGeneral() {
    return this.card.blueprint.kind == CARD_KINDS.GENERAL;
  }

  get card() {
    return this.player.cards[this.cardIndex];
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get hp() {
    return this.interceptors.maxHp.getValue(this.currentHp.value, this);
  }

  private set hp(val: number) {
    this.currentHp.value = Math.min(val, this.maxHp);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.card.maxHp, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.card.attack, this);
  }

  get speed(): number {
    return this.interceptors.speed.getValue(this.card.speed, this);
  }

  get range(): number {
    return this.interceptors.range.getValue(this.card.range, this);
  }

  canMove(distance: number) {
    return this.interceptors.canMove.getValue(
      distance <= this.speed && this.movementsTaken < 1,
      this
    );
  }

  canRetaliate(source: Entity) {
    return this.interceptors.canRetaliate.getValue(this.canAttackAt(source.position), {
      entity: this,
      source
    });
  }

  canBeAttacked(source: Entity) {
    return this.interceptors.canBeAttackTarget.getValue(true, { entity: this, source });
  }

  canBeSkillTarget(skill: Skill) {
    return this.interceptors.canBeSkillTarget.getValue(true, { entity: this, skill });
  }

  canAttackAt(point: Point3D, simulatedPosition?: Point3D) {
    return isWithinCells(simulatedPosition ?? this.position, point, this.range);
  }

  canUseSkill(skill: Skill) {
    return this.interceptors.canUseSkill.getValue(this.skillsUsed < 1 && skill.canUse, {
      entity: this,
      skill
    });
  }

  canUseSkillAt(skill: Skill, point: Point3D, castPoints: Point3D[]) {
    if (castPoints.some(p => Vec3.fromPoint3D(p).equals(point))) return false;

    const entity = this.session.entitySystem.getEntityAt(point);
    if (entity && !entity.canBeSkillTarget(skill)) return false;

    return skill.isTargetable(point, castPoints) && this.canUseSkill(skill);
  }

  canAttack(target: Entity) {
    if (!this.canAttackAt(target.position)) return false;

    const baseValue =
      this.attacksTaken < 1 &&
      this.canAttackAt(target.position) &&
      isEnemy(this.session, target.id, this.playerId);

    return (
      this.interceptors.canAttack.getValue(baseValue, { entity: this, target }) &&
      target.canBeAttacked(this)
    );
  }

  addInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
  }

  clearAllInterceptors() {
    Object.values(this.interceptors).forEach(interceptor => interceptor.clear());
  }

  endTurn() {
    this.movementsTaken = 0;
    this.attacksTaken = 0;
    this.skillsUsed = 0;
    this.retaliationsDone = 0;
    this.isExhausted = false;
  }

  startTurn() {
    this.skills.forEach(skill => skill.onTurnStart());
  }

  destroy() {
    this.emit(ENTITY_EVENTS.BEFORE_DESTROY, this);
    this.session.fxSystem.playAnimation(this.id, 'death').then(() => {
      this.session.entitySystem.removeEntity(this);

      this.session.actionSystem.schedule(() => {
        this.emit(ENTITY_EVENTS.AFTER_DESTROY, this);
        this.modifiers.forEach(modifier => {
          modifier.onRemoved(this.session, this, modifier);
        });
        this.session.boardSystem.getCellAt(this.position)!.tile = new Tile(this.session, {
          position: this.position,
          blueprintId: 'gold-coin'
        });
      });
    });
  }

  async move(path: Point3D[]) {
    this.emit(ENTITY_EVENTS.BEFORE_MOVE, this);

    const stopRunning = this.session.fxSystem.playAnimationUntil(this.id, 'run');
    await this.session.fxSystem.moveEntity(
      this.id,
      path.map(point => ({
        point,
        duration: 0.4
      }))
    );
    stopRunning();
    for (const point of path) {
      this.position = Vec3.fromPoint3D(point);
    }

    this.movementsTaken++;
    this.checkExhaustion();
    this.emit(ENTITY_EVENTS.AFTER_MOVE, this);
  }

  getTakenDamage(amount: number) {
    return this.interceptors.damageTaken.getValue(amount, {
      entity: this,
      amount
    });
  }

  getHealReceived(amount: number) {
    const clamped = Math.min(amount, this.maxHp - this.hp);
    return this.interceptors.healReceived.getValue(clamped, {
      entity: this,
      amount: clamped
    });
  }

  async dealDamage(power: number, target: Entity) {
    const payload = {
      entity: this,
      amount: power,
      target
    };
    this.emit(ENTITY_EVENTS.BEFORE_DEAL_DAMAGE, payload);

    // await this.session.fxSystem.playAnimation(this.id, 'attack', {
    //   framePercentage: 0.75
    // });
    await this.session.fxSystem.attack(this.id, target.id);

    await target.takeDamage(power, this);

    this.emit(ENTITY_EVENTS.AFTER_DEAL_DAMAGE, payload);
  }

  async takeDamage(power: number, source: Entity) {
    const amount = this.getTakenDamage(power);
    const payload = {
      entity: this,
      amount,
      source
    };
    this.emit(ENTITY_EVENTS.BEFORE_TAKE_DAMAGE, payload);

    const bloodFx = this.session.rngSystem.nextInt(4);
    await Promise.all([
      this.session.fxSystem.playSfxOnEntity(this.id, {
        resourceName: 'fx_bloodground',
        animationName: bloodFx <= 1 ? 'default' : `bloodground${bloodFx ? bloodFx : ''}`,
        offset: {
          x: 0,
          y: 20
        }
      }),
      this.session.fxSystem.playAnimation(this.id, 'hit'),
      this.session.fxSystem.shakeEntity(this.id, {
        amount: 5,
        axis: 'x',
        count: 3,
        totalDuration: 0.3
      })
    ]);

    this.hp = this.currentHp.value - amount;
    this.emit(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, payload);
  }

  private checkExhaustion() {
    if (!this.movementsTaken) return;
    if (this.attacksTaken || !!this.skillsUsed) {
      this.isExhausted = true;
    }
  }

  retaliate(power: number, target: Entity) {
    this.retaliationsDone++;
    return this.dealDamage(power, target);
  }

  async performAttack(target: Entity) {
    this.emit(ENTITY_EVENTS.BEFORE_ATTACK, { entity: this, target });
    await this.dealDamage(this.attack, target);

    if (target.canRetaliate(this)) {
      await target.retaliate(target.attack, this);
    }

    this.attacksTaken++;
    this.checkExhaustion();

    this.emit(ENTITY_EVENTS.AFTER_ATTACK, { entity: this, target });
  }

  async useSkill(index: number, castPoints: Point3D[]) {
    const skill = this.skills[index];

    this.emit(ENTITY_EVENTS.BEFORE_USE_SKILL, {
      entity: this,
      skill,
      castPoints
    });

    await skill.use(castPoints);

    this.skillsUsed++;
    this.checkExhaustion();

    this.emit(ENTITY_EVENTS.AFTER_USE_SKILL, {
      entity: this,
      skill,
      castPoints
    });
  }

  async heal(baseAmount: number, source: Entity) {
    const amount = this.getHealReceived(baseAmount);

    const payload = {
      entity: this,
      amount,
      source
    };
    this.emit(ENTITY_EVENTS.BEFORE_HEAL, payload);

    this.hp += amount;

    this.emit(ENTITY_EVENTS.AFTER_HEAL, payload);
  }

  getModifier(id: ModifierId) {
    return this.modifiers.find(m => m.id === id);
  }

  addModifier(modifier: EntityModifier) {
    const existing = this.getModifier(modifier.id);
    if (existing) {
      if (existing.stackable) {
        existing.stacks++;
        return;
      } else {
        return existing.onReapply(this.session, this, existing);
      }
    }

    this.modifiers.push(modifier);
    return modifier.onApplied(this.session, this, modifier);
  }

  removeModifier(modifierId: ModifierId, ignoreStacks = false) {
    this.modifiers.forEach(mod => {
      if (mod.id !== modifierId) return;

      if (mod.stackable && mod.stacks > 1 && !ignoreStacks) return;
      mod.onRemoved(this.session, this, mod);
    });

    this.modifiers = this.modifiers.filter(mod => {
      if (mod.id !== modifierId) return true;

      if (mod.stackable && mod.stacks > 1 && !ignoreStacks) return true;

      return false;
    });
  }

  isAlly(entityId: EntityId) {
    return isAlly(this.session, entityId, this.playerId);
  }

  isEnemy(entityId: EntityId) {
    return isEnemy(this.session, entityId, this.playerId);
  }

  hasKeyword(keyword: Keyword) {
    return this.modifiers.some(mod => mod.keywords.some(k => keyword.id === k.id));
  }
}