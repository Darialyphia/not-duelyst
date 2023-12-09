<script setup lang="ts">
import { Application, BaseTexture, SCALE_MODES, WRAP_MODES } from 'pixi.js';
import { appInjectKey, createApp } from 'vue3-pixi';
import * as PIXI from 'pixi.js';
import PixiPlugin from 'gsap/PixiPlugin';
import PixiRenderer from './PixiRenderer.vue';
import type { Entity } from '@hc/sdk/src/entity/entity';
import type { GameSession } from '@hc/sdk';
import type { Point3D } from '@hc/sdk/src/types';
import type { Skill } from '@hc/sdk/src/skill/skill-builder';
import type { Cell } from '@hc/sdk/src/map/cell';
import type { UnitBlueprint } from '@hc/sdk/src/units/unit-lookup';
import type { GameEmits } from '../../composables/useGame';

const emit = defineEmits<GameEmits>();

const { gameSession } = defineProps<{ gameSession: GameSession }>();

const game = useGameProvider(gameSession, emit);
const { state, ui, mapRotation, assets } = game;

const distanceMap = computed(() => {
  return gameSession.map.getDistanceMap(
    state.value.activeEntity.position,
    state.value.activeEntity.speed
  );
});

const isMoveTarget = (point: Point3D) => {
  if (ui.targetMode.value !== 'move') return false;
  return state.value.activeEntity.canMove(distanceMap.value.get(point));
};

const isSkillTarget = (point: Point3D) => {
  if (ui.targetMode.value !== 'skill') return false;
  if (!ui.selectedSkill.value) return false;

  return ui.selectedSkill.value.isTargetable(
    gameSession,
    point,
    state.value.activeEntity
  );
};

const isSummonTarget = (point: Point3D) => {
  if (ui.targetMode.value !== 'summon') return false;

  return (
    gameSession.map.canSummonAt(point) &&
    gameSession.entityManager.hasNearbyAllies(point, state.value.activeEntity.playerId)
  );
};

const onCellClick = (cell: Cell) => {
  if (isMoveTarget(cell.position)) {
    return emit('move', {
      ...cell.position,
      entityId: state.value.activeEntity.id
    });
  }
  if (isSkillTarget(cell.position)) {
    return emit('use-skill', {
      target: cell.position,
      skillId: ui.selectedSkill.value!.id
    });
  }
  if (isSummonTarget(cell.position)) {
    return emit('summon', {
      position: cell.position,
      unitId: ui.selectedSummon.value!.id
    });
  }
};

const onEntityClick = (entity: Entity) => {
  if (isSkillTarget(entity.position)) {
    emit('use-skill', {
      target: entity.position,
      skillId: ui.selectedSkill.value!.id
    });
  }
};

const activePlayer = computed(
  () => gameSession.playerManager.getPlayerById(state.value.activeEntity.playerId)!
);

// @ts-ignore  enable PIXI devtools
window.PIXI = PIXI;
window.gsap.registerPlugin(PixiPlugin);

const canvas = ref<HTMLCanvasElement>();

onMounted(async () => {
  // We create the pixi app manually instead of using vue3-pixi's <Application /> component
  // because we want to be able to provide a bunch of stuff so we need access to the underlying vue-pixi app
  // and we can forward the providers to it
  const pixiApp = new Application({
    view: canvas.value,
    width: window.innerWidth,
    height: window.innerHeight,
    autoDensity: true,
    antialias: false
  });

  // pixiApp.stage = new Stage();

  if (import.meta.env.DEV) {
    // @ts-ignore  enable PIXI devtools
    window.__PIXI_APP__ = pixiApp;
  }
  gsap.registerPlugin(PixiPlugin);
  gsap.install(window);

  BaseTexture.defaultOptions.wrapMode = WRAP_MODES.CLAMP;
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

  const app = createApp(PixiRenderer);
  app.provide(appInjectKey, pixiApp);
  app.provide(GAME_INJECTION_KEY, game);

  await assets.load();
  app.mount(pixiApp.stage);
});

const maxZ = computed(() => Math.max(...state.value.map.cells.map(c => c.z)));
const getCellsByZ = (z: number) => state.value.map.cells.filter(c => c.z === z);
const getEntitiesByZ = (z: number) =>
  state.value.entities.filter(c => c.position.z === z);

const rotateMap = (diff: number) => {
  mapRotation.value = ((mapRotation.value + diff) % 360) as any;
};

const setTargetMode = (mode: (typeof ui)['targetMode']['value']) => {
  ui.targetMode.value = mode;
};
</script>

<template>
  <div class="relative">
    <div class="pixi-app-container">
      <canvas ref="canvas" @contextmenu.prevent />
      <header>
        <button @click="rotateMap(90)">Rotate CW</button>
        <button @click="rotateMap(-90)">Rotate CCW</button>

        <button @click="emit('end-turn')">End turn</button>
        <button @click="setTargetMode('move')">Move</button>
        Skills
        <button
          v-for="skill in state.activeEntity.skills"
          :key="skill.id"
          :disabled="!state.activeEntity.canUseSkill(skill)"
          @click="ui.selectedSkill.value = skill"
        >
          {{ skill.id }} ({{ skill.cost }})
          {{ state.activeEntity.skillCooldowns[skill.id] }}
        </button>
        Loadout
        <template v-if="state.activeEntity.kind === 'GENERAL'">
          <button
            v-for="unit in activePlayer.summonableUnits"
            :disabled="!activePlayer.canSummon(unit.unit.id)"
            @click="ui.selectedSummon.value = unit.unit"
          >
            {{ unit.unit.id }} ({{ unit.unit.summonCost }})
          </button>
        </template>
      </header>
      <!-- <div class="map">
        <div v-for="z in maxZ + 1" :key="z">
          <div
            v-for="cell in getCellsByZ(z - 1)"
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
          >
            {{ cell.x }}:{{ cell.y }}:{{ cell.z }}
          </div>

          <div
            v-for="entity in getEntitiesByZ(z - 1)"
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
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped lang="postcss">
.game-app-container {
  user-select: none;

  position: relative;

  overflow: hidden;

  font-family: monospace;
  color: var(--gray-0);
}

header {
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  gap: var(--size-3);
  align-items: center;

  width: 100%;
  padding-block: var(--size-3);
}

button {
  cursor: pointer;

  padding: var(--size-2) var(--size-3);

  color: white;

  background-color: var(--blue-7);
  border-radius: var(--radius-1);

  &:disabled {
    opacity: 0.5;
  }
}

.map {
  position: absolute;
  top: var(--size-10);
  & > div {
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
