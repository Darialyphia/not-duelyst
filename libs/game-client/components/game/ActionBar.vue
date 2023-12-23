<script setup lang="ts">
import { unitImagesPaths } from '../../assets/units';
import { skillImagesPaths } from '../../assets/skills';
import { exhaustiveSwitch } from '@hc/shared';

import havenBorder from '../../assets/ui/icon-border-haven.png';
import havenBorderRounded from '../../assets/ui/icon-border-haven-rounded.png';
import chaosBorder from '../../assets/ui/icon-border-chaos.png';
import chaosBorderRounded from '../../assets/ui/icon-border-chaos-rounded.png';

const { state, sendInput } = useGame();
const { selectedSummon, selectedEntity, selectedSkill, skillTargets } = useGameUi();

const activePlayer = computed(() => state.value.activePlayer);

const borders = computed(() => {
  switch (state.value.activePlayer.general.unit.faction.id) {
    case 'haven':
      return { square: havenBorder, rounded: havenBorderRounded };
    case 'chaos':
      return { square: chaosBorder, rounded: chaosBorderRounded };
    default:
      throw exhaustiveSwitch;
  }
});
</script>

<template>
  <div v-if="selectedSkill" class="targets-indicator">
    <div class="fancy-surface">
      Targets: {{ skillTargets.size }} / {{ selectedSkill?.maxTargets }}
    </div>
    <UiButton
      v-if="skillTargets.size >= selectedSkill.minTargets"
      :style="{
        '--d-button-bg': 'var(--teal-7)',
        '--d-button-hover-bg': 'var(--teal-6)',
        '--d-button-color': 'var(--gray-0)',
        '--d-button-hover-color': 'var(--gray-0)'
      }"
      @click="
        () => {
          sendInput('use-skill', {
            entityId: selectedEntity!.id,
            skillId: selectedSkill!.id,
            targets: [...skillTargets.values()]
          });
        }
      "
    >
      Cast
    </UiButton>
  </div>
  <div v-if="selectedEntity" class="flex gap-4 pb-2">
    <button
      v-for="skill in selectedEntity.skills"
      :key="skill.id"
      class="skill"
      :class="{
        active: selectedSkill?.id === skill.id,
        unavailable: selectedEntity.ap < skill.cost
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
  </div>

  <div class="action-bar content-surface">
    <div class="actions">
      <div>
        <UiTooltip
          v-for="unit in activePlayer.summonableUnits"
          :key="unit.unit.id"
          :side-offset="50"
          :delay="200"
        >
          <template #trigger>
            <button
              :disabled="!activePlayer.canSummon(unit.unit.id)"
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
      :style="{
        '--d-button-bg': 'var(--red-9)',
        '--d-button-hover-bg': 'var(--red-8)',
        '--d-button-color': 'var(--gray-0)',
        '--d-button-hover-color': 'var(--gray-0)'
      }"
      class="end-turn"
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
  padding: var(--size-6);

  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);
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
}

.skill-tooltip {
  max-width: var(--size-14);
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
