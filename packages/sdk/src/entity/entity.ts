import { type Serializable, Vec3, type Values } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Point3D } from '../types';
import EventEmitter from 'eventemitter3';
import type { CardIndex, PlayerId } from '../player/player';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { isAlly, isEnemy } from './entity-utils';
import { isWithinCells } from '../utils/targeting';
import { type EntityModifier, type ModifierId } from '../modifier/entity-modifier';
import { CARD_KINDS } from '../card/card-enums';
import { KEYWORDS, type Keyword } from '../utils/keywords';
import { Skill } from './skill';
import { uniqBy } from 'lodash-es';
import type { CardModifier } from '../modifier/card-modifier';
import { type Cell } from '../board/cell';
import { TERRAINS } from '../board/board-utils';

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

  BEFORE_RETALIATE: 'before_realiate',
  AFTER_RETALIATE: 'after_realiate',

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
  isAbilityDamage: boolean;
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

  [ENTITY_EVENTS.BEFORE_MOVE]: [{ entity: Entity; path: Point3D[] }];
  [ENTITY_EVENTS.AFTER_MOVE]: [
    { entity: Entity; path: Point3D[]; previousPosition: Vec3 }
  ];

  [ENTITY_EVENTS.BEFORE_DEAL_DAMAGE]: [event: DealDamageEvent];
  [ENTITY_EVENTS.AFTER_DEAL_DAMAGE]: [event: DealDamageEvent];

  [ENTITY_EVENTS.BEFORE_TAKE_DAMAGE]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_TAKE_DAMAGE]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.BEFORE_HEAL]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_HEAL]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.BEFORE_ATTACK]: [event: AttackEvent];
  [ENTITY_EVENTS.AFTER_ATTACK]: [event: AttackEvent];

  [ENTITY_EVENTS.BEFORE_RETALIATE]: [event: AttackEvent];
  [ENTITY_EVENTS.AFTER_RETALIATE]: [event: AttackEvent];

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

  movementsTaken = 0;
  attacksTaken = 0;
  retaliationsDone = 0;
  skillsUsed = 0;

  private isScheduledForDeletion = false;

  private currentHp = 0;

  private interceptors = {
    attack: new Interceptable<number, Entity>(),
    maxHp: new Interceptable<number, Entity>(),
    speed: new Interceptable<number, Entity>(),
    range: new Interceptable<number, Entity>(),

    maxRetalitions: new Interceptable<number, Entity>(),
    maxAttacks: new Interceptable<number, Entity>(),
    maxMovements: new Interceptable<number, Entity>(),
    maxSkills: new Interceptable<number, Entity>(),

    canMove: new Interceptable<boolean, Entity>(),
    canAttack: new Interceptable<boolean, { entity: Entity; target: Entity }>(),
    canRetaliate: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    canUseSkill: new Interceptable<boolean, { entity: Entity; skill: Skill }>(),

    canMoveThroughCell: new Interceptable<boolean, { entity: Entity; cell: Cell }>(),
    canBeAttackTarget: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    canBeSkillTarget: new Interceptable<boolean, { entity: Entity; skill: Skill }>(),

    damageDealt: new Interceptable<
      number,
      { entity: Entity; amount: number; isAbilityDamage: boolean }
    >(),
    damageTaken: new Interceptable<
      number,
      { entity: Entity; amount: number; isAbilityDamage: boolean }
    >(),
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
    this.skills = this.card.blueprint.skills.map(
      blueprint => new Skill(this.session, blueprint, this)
    );
    this.currentHp = options.hp ?? this.maxHp;
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
    return this.interceptors.maxHp.getValue(this.currentHp, this);
  }

  private set hp(val: number) {
    this.currentHp = Math.min(val, this.maxHp);
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

  get maxMovements(): number {
    return this.interceptors.maxMovements.getValue(1, this);
  }

  get maxAttacks(): number {
    return this.interceptors.maxAttacks.getValue(1, this);
  }

  get maxRetaliations(): number {
    return this.interceptors.maxRetalitions.getValue(1, this);
  }

  get maxSkills(): number {
    return this.interceptors.maxSkills.getValue(1, this);
  }

  canMoveThroughCell(cell: Cell) {
    return this.interceptors.canMoveThroughCell.getValue(
      !cell.entity && cell.terrain === TERRAINS.GROUND,
      { entity: this, cell }
    );
  }

  canMove(distance: number) {
    return this.interceptors.canMove.getValue(
      distance <= this.speed && this.movementsTaken < this.maxMovements,
      this
    );
  }

  canRetaliate(source: Entity) {
    return this.interceptors.canRetaliate.getValue(
      this.canAttackAt(source.position) && this.retaliationsDone < this.maxRetaliations,
      {
        entity: this,
        source
      }
    );
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
    const baseValue =
      skill.canUse && this.skillsUsed < this.maxSkills && this.attacksTaken === 0;

    return this.interceptors.canUseSkill.getValue(baseValue, {
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
    const baseValue =
      this.attacksTaken < this.maxAttacks &&
      this.skillsUsed < this.maxSkills &&
      this.canAttackAt(target.position) &&
      isEnemy(this.session, target.id, this.playerId);

    return (
      this.interceptors.canAttack.getValue(baseValue, { entity: this, target }) &&
      target.canBeAttacked(this)
    );
  }

  private checkHpForDeletion() {
    if (this.isScheduledForDeletion) return;

    if (this.hp <= 0) {
      this.isScheduledForDeletion = true;
      this.session.actionSystem.schedule(() => {
        this.destroy();
      });
    }
  }
  addInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    this.checkHpForDeletion();
    return () => this.removeInterceptor(key, interceptor);
  }

  addInterceptorUntilEndOfTurn<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>,
    priority?: number
  ) {
    const unsub = this.addInterceptor(key, interceptor, priority);
    this.session.once('player:turn_end', unsub);
  }

  removeInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
    this.checkHpForDeletion();
  }

  clearAllInterceptors() {
    Object.values(this.interceptors).forEach(interceptor => interceptor.clear());
  }

  endTurn() {
    this.movementsTaken = 0;
    this.attacksTaken = 0;
    this.skillsUsed = 0;
    this.retaliationsDone = 0;
  }

  startTurn() {
    this.skills.forEach(skill => skill.onTurnStart());
  }

  destroy() {
    this.emit(ENTITY_EVENTS.BEFORE_DESTROY, this);
    this.session.entitySystem.removeEntity(this);
    this.session.actionSystem.schedule(() => {
      this.modifiers.forEach(modifier => {
        modifier.onRemoved(this.session, this, modifier);
      });

      this.emit(ENTITY_EVENTS.AFTER_DESTROY, this);
    });
    // this.session.fxSystem.playAnimation(this.id, 'death').then(async () => {
    //   await this.session.fxSystem.fadeOutEntity(this.id, 0.8);

    // });
  }

  move(path: Point3D[], isDisplacement = false) {
    this.emit(ENTITY_EVENTS.BEFORE_MOVE, { entity: this, path });
    const currentPosition = this.position;

    // const stopRunning = this.session.fxSystem.playAnimationUntil(this.id, 'run');
    // await this.session.fxSystem.moveEntity(
    //   this.id,
    //   path.map(point => ({
    //     point,
    //     duration: 0.4
    //   }))
    // );
    // stopRunning();
    for (const point of path) {
      this.position = Vec3.fromPoint3D(point);
    }

    if (!isDisplacement) {
      this.movementsTaken++;
    }
    this.emit(ENTITY_EVENTS.AFTER_MOVE, {
      entity: this,
      path,
      previousPosition: currentPosition
    });
  }

  getTakenDamage(
    amount: number,
    { isAbilityDamage }: { isAbilityDamage: boolean } = { isAbilityDamage: true }
  ) {
    return this.interceptors.damageTaken.getValue(amount, {
      entity: this,
      amount,
      isAbilityDamage
    });
  }

  getHealReceived(amount: number) {
    const clamped = Math.min(amount, this.maxHp - this.hp);
    return this.interceptors.healReceived.getValue(clamped, {
      entity: this,
      amount: clamped
    });
  }

  dealDamage(
    power: number,
    target: Entity,
    { isAbilityDamage }: { isAbilityDamage: boolean } = { isAbilityDamage: true }
  ) {
    const payload = {
      entity: this,
      amount: this.interceptors.damageDealt.getValue(power, {
        entity: this,
        isAbilityDamage,
        amount: power
      }),
      isAbilityDamage,
      target
    };
    this.emit(ENTITY_EVENTS.BEFORE_DEAL_DAMAGE, payload);

    target.takeDamage(payload.amount, this, { isAbilityDamage });

    this.emit(ENTITY_EVENTS.AFTER_DEAL_DAMAGE, payload);
  }

  takeDamage(
    power: number,
    source: Entity,
    { isAbilityDamage }: { isAbilityDamage: boolean } = { isAbilityDamage: true }
  ) {
    const amount = this.getTakenDamage(power, { isAbilityDamage });
    const payload = {
      entity: this,
      amount,
      source
    };
    this.emit(ENTITY_EVENTS.BEFORE_TAKE_DAMAGE, payload);
    // const bloodFx = this.session.rngSystem.nextInt(4);
    // await Promise.all([
    //   this.session.fxSystem.playSfxOnEntity(this.id, {
    //     resourceName: 'fx_bloodground',
    //     animationName: bloodFx <= 1 ? 'default' : `bloodground${bloodFx ? bloodFx : ''}`,
    //     offset: {
    //       x: 0,
    //       y: 20
    //     }
    //   }),
    //   this.session.fxSystem.playAnimation(this.id, 'hit'),
    //   this.session.fxSystem.shakeEntity(this.id, {
    //     amount: 5,
    //     axis: 'x',
    //     count: 3,
    //     totalDuration: 0.3
    //   })
    // ]);

    this.hp = this.currentHp - amount;
    this.checkHpForDeletion();

    this.emit(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, payload);
  }

  get isExhausted(): boolean {
    if (this.player.isActive) {
      return (
        !this.canMove(0) &&
        !this.skills.some(skill => this.canUseSkill(skill)) &&
        !this.player.opponent.entities.some(entity => this.canAttack(entity))
      );
    } else {
      return this.retaliationsDone >= this.maxRetaliations;
    }
  }

  retaliate(power: number, target: Entity) {
    if (!this.canRetaliate(target)) return;
    this.emit(ENTITY_EVENTS.BEFORE_RETALIATE, { entity: this, target });
    this.retaliationsDone++;
    // await this.session.fxSystem.playAnimation(this.id, 'attack', {
    //   framePercentage: 0.75
    // });
    // await this.session.fxSystem.attack(this.id, target.id);
    this.dealDamage(power, target, { isAbilityDamage: false });
    this.emit(ENTITY_EVENTS.AFTER_RETALIATE, { entity: this, target });
  }

  performAttack(target: Entity) {
    this.emit(ENTITY_EVENTS.BEFORE_ATTACK, { entity: this, target });

    // await this.session.fxSystem.playAnimation(this.id, 'attack', {
    //   framePercentage: 0.75
    // });
    // await this.session.fxSystem.attack(this.id, target.id);

    this.dealDamage(this.attack, target, { isAbilityDamage: false });

    target.retaliate(target.attack, this);

    this.attacksTaken++;
    this.addInterceptorUntilEndOfTurn('canUseSkill', () => false);
    this.emit(ENTITY_EVENTS.AFTER_ATTACK, { entity: this, target });
  }

  useSkill(index: number, castPoints: Point3D[], blueprintFollowup: number[]) {
    const skill = this.skills[index];

    this.emit(ENTITY_EVENTS.BEFORE_USE_SKILL, {
      entity: this,
      skill,
      castPoints
    });

    skill.use(castPoints, blueprintFollowup);

    this.skillsUsed++;
    this.addInterceptorUntilEndOfTurn('canAttack', () => false);

    this.emit(ENTITY_EVENTS.AFTER_USE_SKILL, {
      entity: this,
      skill,
      castPoints
    });
  }

  heal(baseAmount: number, source: Entity) {
    const amount = this.getHealReceived(baseAmount);

    const payload = {
      entity: this,
      amount,
      source
    };
    this.emit(ENTITY_EVENTS.BEFORE_HEAL, payload);

    this.hp += amount;
    this.checkHpForDeletion();

    this.emit(ENTITY_EVENTS.AFTER_HEAL, payload);
  }

  getModifier(id: ModifierId) {
    return this.modifiers.find(m => m.id === id);
  }

  hasModifier(id: ModifierId) {
    return this.modifiers.some(m => m.id === id);
  }

  addModifier(modifier: EntityModifier) {
    const existing = this.getModifier(modifier.id);

    if (existing) {
      if (existing.stackable) {
        existing.stacks += modifier.stacks ?? 1;
        return;
      } else {
        return existing.onReapply(this.session, this, existing);
      }
    }

    this.modifiers.push(modifier);

    return modifier.onApplied(this.session, this, modifier);
  }

  removeModifier(modifierId: ModifierId, stacksToRemove = 1) {
    this.modifiers.forEach(mod => {
      if (mod.id !== modifierId) return;

      if (mod.stackable) {
        mod.stacks -= stacksToRemove;
        if (mod.stacks < 1) {
          mod.onRemoved(this.session, this, mod);
        }
      } else {
        mod.onRemoved(this.session, this, mod);
      }
    });

    this.modifiers = this.modifiers.filter(mod => {
      if (mod.id !== modifierId) return true;

      if (mod.stackable) return mod.stacks >= 1;

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
    return (
      this.modifiers.some(mod => mod.keywords.some(k => keyword.id === k.id)) ||
      this.card.modifiers.some(mod => mod.keywords.some(k => keyword.id === k.id))
    );
  }

  get keywords() {
    const allModifiers: Array<EntityModifier | CardModifier> = [
      ...this.modifiers,
      ...this.card.modifiers
    ];

    const keywordsWithStacks = new Map<string, Keyword & { stacks?: number }>();

    if (this.card.isGenerated) {
      keywordsWithStacks.set(KEYWORDS.SUMMON.id, {
        ...KEYWORDS.SUMMON,
        stacks: undefined
      });
    }

    for (const modifier of allModifiers) {
      modifier.keywords.forEach(keyword => {
        if (!keywordsWithStacks.has(keyword.id)) {
          keywordsWithStacks.set(keyword.id, {
            ...keyword,
            stacks: modifier.stackable ? modifier.stacks : undefined
          });
        } else if (modifier.stackable) {
          // @ts-expect-error
          keywordsWithStacks.get(keyword.id)!.stacks++;
        }
      });
    }

    return uniqBy([...keywordsWithStacks.values()], 'id');
  }
}
