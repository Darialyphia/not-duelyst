import { Entity, EntityId } from './entity/entity';

export const MAX_ATB = 100;

export class ATB {
  public activeEntity!: Entity;

  getHighestActiveEntity(entities: Entity[]) {
    return entities
      .filter(e => e.atb >= MAX_ATB)
      .sort((a, b) => b.atb - a.atb)
      .at(0);
  }

  tickUntilActiveEntity(entities: Entity[]) {
    let activeEntity = this.getHighestActiveEntity(entities);

    while (!activeEntity) {
      entities.forEach(e => {
        e.atb += e.initiative;
      });

      activeEntity = this.getHighestActiveEntity(entities);
    }

    this.activeEntity = activeEntity;
    this.activeEntity.resetAp();
  }
}
