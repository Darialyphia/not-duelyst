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

  tickUntilActiveEntity(entities: Entity[], dryRun?: boolean) {
    let activeEntity = this.getHighestActiveEntity(entities);

    while (!activeEntity) {
      entities.forEach(e => {
        e.atb += e.initiative;
      });

      activeEntity = this.getHighestActiveEntity(entities);
    }

    if (!dryRun) {
      this.activeEntity = activeEntity;
    }
    return activeEntity;
  }

  getTimeline(entities: Entity[], length: number) {
    const timeline: Entity[] = [];

    const clones = entities.map(entity => entity.clone());

    for (let i = 0; i <= length; i++) {
      let active = this.tickUntilActiveEntity(clones, true);
      timeline.push(active);
      active.atb = active.atbSeed;
    }

    return timeline;
  }
}
