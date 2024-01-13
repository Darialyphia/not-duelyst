<script setup lang="ts">
import { unitImagesPaths } from '../../assets/units';
import { skillImagesPaths } from '../../assets/skills';

const { playerId, isActivePlayer, state, sendInput, isReplay } = useGame();
const {
  targetMode,
  summonTargets,
  selectedSummon,
  selectedEntity,
  selectedSkill,
  skillTargets,
  summonSpawnPoint
} = useGameUi();

const player = computed(() => {
  if (!playerId) return state.value.activePlayer;

  return state.value.players.find(p => p.id === playerId)!;
});

const borders = computed(
  () => factionUtils[player.value.general.unit.faction.id].borders
);

const targetsCount = computed(() => {
  if (targetMode.value === 'skill') return skillTargets.value.size;
  if (targetMode.value === 'summon-targets') return summonTargets.value.size;
  return 0;
});
const maxTargetsCount = computed(() => {
  if (targetMode.value === 'skill') return selectedSkill.value?.maxTargets;
  if (targetMode.value === 'summon-targets') {
    return selectedSummon.value?.onSummoned?.maxTargetCount;
  }
  return 0;
});

const isValidateTargetsButtonDisplayed = computed(() => {
  if (targetMode.value === 'skill') {
    return skillTargets.value.size >= selectedSkill.value!.minTargets;
  }

  if (targetMode.value === 'summon-targets') {
    return summonTargets.value.size >= selectedSummon.value!.onSummoned!.minTargetCount;
  }

  return false;
});

const validateTargetButtonLabel = computed(() => {
  if (targetMode.value === 'skill') {
    return 'Cast';
  }

  if (targetMode.value === 'summon-targets') {
    return 'Summon';
  }

  return '';
});

const onValidateTargets = () => {
  if (targetMode.value === 'skill') {
    return sendInput('use-skill', {
      entityId: selectedEntity.value!.id,
      skillId: selectedSkill.value!.id,
      targets: [...skillTargets.value]
    });
  }

  if (targetMode.value === 'summon-targets') {
    return sendInput('summon', {
      position: summonSpawnPoint.value!,
      unitId: selectedSummon.value!.id,
      targets: [...summonTargets.value]
    });
  }
};
</script>

<template>
  <div v-if="selectedSkill || targetMode === 'summon-targets'" class="targets-indicator">
    <div class="fancy-surface">Targets: {{ targetsCount }} / {{ maxTargetsCount }}</div>
    <UiButton
      v-if="isValidateTargetsButtonDisplayed"
      class="primary-button"
      @click="onValidateTargets"
    >
      {{ validateTargetButtonLabel }}
    </UiButton>
  </div>

  <div
    v-if="selectedEntity && selectedEntity.player.equals(state.activePlayer)"
    class="flex gap-4 pb-2"
  >
    <UiTooltip
      v-for="skill in selectedEntity.skills"
      :key="skill.id"
      :side-offset="20"
      :delay="200"
    >
      <template #trigger>
        <button
          class="skill"
          :class="{
            active: selectedSkill?.id === skill.id,
            unavailable: !selectedEntity.canUseSkill(skill)
          }"
          :disabled="!selectedEntity.canUseSkill(skill)"
          :data-cost="skill.cost"
          :data-cooldown="
            selectedEntity.skillCooldowns[skill.id] > 0
              ? selectedEntity.skillCooldowns[skill.id]
              : ''
          "
          :style="{
            '--cooldown-angle':
              360 - (360 * selectedEntity.skillCooldowns[skill.id]) / skill.cooldown,
            '--bg': `url(${skillImagesPaths[skill.spriteId]})`,
            '--border': `url(${borders.square})`
          }"
          @click="selectedSkill = skill"
        />
      </template>

      <div class="fancy-surface skill-tooltip">
        <div class="flex justify-between">
          <span>cost: {{ skill.cost }}</span>
          <span>cooldown: {{ skill.cooldown }}</span>
        </div>
        <h4>{{ skill.name }}</h4>
        <p>{{ skill.getText(selectedEntity) }}</p>
      </div>
    </UiTooltip>
  </div>

  <div class="action-bar">
    <div class="actions">
      <div>
        <UiTooltip
          v-for="unit in player.summonableUnits"
          :key="unit.unit.id"
          :side-offset="50"
          :delay="200"
        >
          <template #trigger>
            <button
              :disabled="!player.canSummon(unit.unit.id)"
              class="summon"
              :class="{
                active: selectedSummon?.id === unit.unit.id,
                unavailable: !state.activePlayer.canSummon(unit.unit.id)
              }"
              :data-cost="unit.unit.summonCost"
              :data-cooldown="unit.cooldown > 0 ? unit.cooldown : ''"
              :style="{
                '--cooldown-angle':
                  360 - (360 * unit.cooldown) / unit.unit.summonCooldown,
                '--bg': `url(${unitImagesPaths[unit.unit.spriteId + '-icon']})`,
                '--border': `url(${borders.rounded})`
              }"
              @mousedown="selectedSummon = unit.unit"
            />
          </template>
          <UnitBlueprintCard :unit="unit.unit" />
        </UiTooltip>
      </div>
    </div>

    <UiButton
      v-if="!isReplay"
      class="end-turn error-button"
      :disabled="!isActivePlayer"
      @click="sendInput('end-turn')"
    >
      End Turn
    </UiButton>
  </div>
</template>

<style scoped lang="postcss">
.action-bar {
  display: flex;
  gap: var(--size-4);
  align-items: center;

  min-width: var(--size-sm);
  padding-block: var(--size-5);

  border-radius: var(--radius-3);

  @screen lt-lg {
    padding: var(--size-3);
  }
}

.active-entity {
  width: 96px;
}

:is(.skill, .summon, .active-entity, .move) {
  aspect-ratio: 1;
  background-image: var(--border), var(--bg);
  background-repeat: no-repeat;
  background-size: cover;
}

:is(.skill, .summon) {
  position: relative;
  width: 64px;
  box-shadow: inset 0 0 0 1px black;

  @screen lt-lg {
    width: 48px;
  }

  &::after {
    content: attr(data-cost);

    position: absolute;
    right: -12px;
    bottom: -7px;

    overflow: hidden;
    display: grid;
    place-content: center;

    aspect-ratio: 1;
    width: 3ch;

    background: var(--fancy-bg);
    background-blend-mode: overlay;
    border: var(--fancy-border);
    border-radius: var(--radius-round);
  }

  &:hover,
  &.active {
    filter: brightness(125%);
    box-shadow: 0 0 8px 2px var(--primary);
  }

  &:disabled {
    cursor: not-allowed;

    &::before {
      content: attr(data-cooldown);

      position: absolute;
      top: 0;
      left: 0;

      display: grid;
      place-content: center;

      width: 100%;
      height: 100%;

      font-size: var(--font-size-5);
      font-weight: var(--font-weight-7);
      color: white;

      background: conic-gradient(
        hsl(var(--gray-11-hsl) / 0.1) calc(1deg * var(--cooldown-angle)),
        hsl(var(--gray-11-hsl) / 0.5) calc(1deg * var(--cooldown-angle))
      );
      border: none;
    }

    &.unavailable {
      filter: sepia(100%) hue-rotate(-70deg) saturate(200%) brightness(75%);
    }
  }
}

.skill {
  width: 64px;
  border-radius: 4px;

  @screen lt-lg {
    width: 48px;
  }
}

.summon {
  border-radius: var(--radius-round);
}

.move {
  position: relative;
  width: 64px;
  box-shadow: inset 0 0 0 1px black;
}
.end-turn {
  margin-left: auto;

  @screen lt-lg {
    --d-button-size: var(--font-size-0);
  }
}

.skill-tooltip {
  max-width: var(--size-14);
  padding-top: var(--size-2);
  > h4 {
    font-size: var(--font-size-2);
  }
  > p {
    max-inline-size: 100%;
    font-size: var(--font-size-0);
  }
}

.actions {
  display: grid;
  row-gap: var(--size-3);

  > div {
    display: flex;
    gap: var(--size-3);
  }
}

.targets-indicator {
  position: absolute;
  top: calc(-1 * var(--size-9));

  display: flex;
  gap: var(--size-5);
  justify-content: center;
  justify-items: center;

  width: 100%;

  font-size: var(--font-size-3);

  > div {
    padding: var(--size-2);
  }

  > button {
    box-shadow: var(--shadow-2);
  }
}
</style>
