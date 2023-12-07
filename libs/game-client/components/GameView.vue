<script setup lang="ts">
import type { Entity, EntityId } from '@hc/sdk/src/entity/entity';
import type { GameSession } from '@hc/sdk';
import type { Point3D } from '@hc/sdk/src/types';
import type { Skill, SkillId } from '../../sdk/src/skill/skill-builder';
import type { Cell } from '../../sdk/src/map/cell';
import type { UnitBlueprint, UnitId } from '../../sdk/src/units/unit-lookup';

const emit = defineEmits<{
  move: [Point3D & { entityId: EntityId }];
  'end-turn': [];
  'use-skill': [{ skillId: SkillId; target: Point3D }];
  summon: [{ unitId: UnitId; position: Point3D }];
}>();

const { gameSession } = defineProps<{ gameSession: GameSession }>();

const state = shallowRef(gameSession.getState());

let unsub: () => void | undefined;
onMounted(() => {
  unsub = gameSession.subscribe(event => {
    targetMode.value = null;
    selectedSkill.value = null;
    state.value = gameSession.getState();
  });
});

onUnmounted(() => {
  unsub?.();
});

const distanceMap = computed(() => {
  return state.value.map.getDistanceMap(
    state.value.activeEntity.position,
    state.value.activeEntity.speed
  );
});

const isMoveTarget = (point: Point3D) => {
  if (targetMode.value !== 'move') return false;

  return state.value.activeEntity.canMove(
    distanceMap.value.get({ ...point, z: point.z + 1 })
  );
};
const isSkillTarget = (point: Point3D) => {
  if (targetMode.value !== 'skill') return false;
  if (!selectedSkill.value) return false;

  return selectedSkill.value.isTargetable(gameSession, point, state.value.activeEntity);
};

const targetMode = ref<null | 'move' | 'skill' | 'summon'>(null);

const selectedSkill = ref<null | Skill>();
const selectSkill = (skill: Skill) => {
  selectedSkill.value = skill;
  targetMode.value = 'skill';
};

const onCellClick = (cell: Cell) => {
  if (isMoveTarget(cell.position)) {
    return emit('move', {
      ...cell.position,
      z: cell.z + 1,
      entityId: state.value.activeEntity.id
    });
  }
  if (isSkillTarget(cell.position)) {
    return emit('use-skill', {
      target: cell.position,
      skillId: selectedSkill.value!.id
    });
  }
  if (isSummonTarget(cell.position)) {
    return emit('summon', {
      position: { ...cell.position, z: cell.position.z + 1 },
      unitId: selectedUnit.value!.id
    });
  }
};

const onEntityClick = (entity: Entity) => {
  if (isSkillTarget(entity.position)) {
    emit('use-skill', {
      target: entity.position,
      skillId: selectedSkill.value!.id
    });
  }
};

const activePlayer = computed(
  () => gameSession.playerManager.getPlayerById(state.value.activeEntity.playerId)!
);

const selectedUnit = ref<UnitBlueprint | null>();
const selectUnit = (unit: UnitBlueprint) => {
  selectedUnit.value = unit;
  targetMode.value = 'summon';
};

const isSummonTarget = (point: Point3D) => {
  if (targetMode.value !== 'summon') return false;

  const above = { ...point, z: point.z + 1 };

  return (
    gameSession.map.canSummonAt(above) &&
    gameSession.entityManager.hasNearbyAllies(above, state.value.activeEntity.playerId)
  );
};
</script>

<template>
  <div class="p-5 bg-surface-1 container">
    <header class="flex gap-3 py-3 items-center">
      <button @click="emit('end-turn')">End turn</button>
      <button @click="targetMode = 'move'">Move</button>
      Skills
      <button
        v-for="skill in state.activeEntity.skills"
        :key="skill.id"
        :disabled="!state.activeEntity.canUseSkill(skill)"
        @click="selectSkill(skill)"
      >
        {{ skill.id }} ({{ skill.cost }})
        {{ state.activeEntity.skillCooldowns[skill.id] }}
      </button>
      Loadout
      <template v-if="state.activeEntity.kind === 'GENERAL'">
        <button
          v-for="unit in activePlayer.summonableUnits"
          :disabled="!activePlayer.canSummon(unit.unit.id)"
          @click="selectUnit(unit.unit)"
        >
          {{ unit.unit.id }} ({{ unit.unit.summonCost }})
        </button>
      </template>
    </header>

    <main class="map">
      <div
        v-for="cell in state.map.cells"
        :key="`${cell.position.toString()}`"
        :style="{ '--col': cell.x + 1, '--row': cell.y + 1 }"
        :class="[
          'cell',
          {
            'move-target': isMoveTarget(cell.position),
            'skill-target': isSkillTarget(cell.position),
            'summon-target': isSummonTarget(cell.position)
          }
        ]"
        @click="onCellClick(cell)"
      />

      <div
        v-for="entity in state.entities"
        :key="entity.id"
        :style="{ '--col': entity.position.x + 1, '--row': entity.position.y + 1 }"
        :class="[
          'entity',
          {
            active: entity.id === state.activeEntity.id,
            'skill-target': isSkillTarget(entity.position)
          }
        ]"
        @click="onEntityClick(entity)"
      >
        {{ entity.hp }}
      </div>
    </main>

    <footer>
      <h2>Game view</h2>
      <h3>Active entity</h3>
      <pre>{{ state.activeEntity.id }} {{ state.activeEntity.unitId }}</pre>
      <pre>
Movement: {{ state.activeEntity.remainingMovement }} / {{ state.activeEntity.speed }}</pre
      >
      <pre>AP: {{ state.activeEntity.ap }} / {{ state.activeEntity.maxAp }}</pre>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
button {
  cursor: pointer;
  padding: var(--size-2) var(--size-3);
  color: white;
  background-color: var(--blue-7);

  &:disabled {
    opacity: 0.5;
  }
}

.map {
  --width: v-bind('state.map.width');
  --height: v-bind('state.map.height');

  display: grid;
  grid-template-columns: repeat(var(--width), 1fr);
  grid-template-rows: repeat(var(--height), 1fr);

  width: calc(3rem * var(--width));
  height: calc(3rem * var(--height));

  border: solid var(--border-size-1) var(--border);

  & > * {
    grid-column: var(--col);
    grid-row: var(--row);
  }
}

.cell {
  border: solid var(--border-size-1) var(--border);

  &.move-target {
    cursor: pointer;
    background-color: hsl(var(--cyan-5-hsl) / 0.3);
    &:hover {
      background-color: hsl(var(--cyan-4-hsl) / 0.3);
    }
  }

  &.summon-target {
    cursor: pointer;
    background-color: hsl(var(--green-5-hsl) / 0.3);
    &:hover {
      background-color: hsl(var(--green-4-hsl) / 0.3);
    }
  }
}

.entity {
  display: grid;
  place-content: center;
  background: var(--blue-7);
  border-radius: var(--radius-round);

  &.active {
    background-color: var(--green-7);
  }
}

.skill-target {
  cursor: pointer;
  box-shadow: inset 0 0 0 3px red;
}
</style>
