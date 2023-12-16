<script setup lang="ts">
import type { Skill, UnitBlueprint } from '@hc/sdk';
import { skillImagesPaths } from '../../assets/skills';
import { unitImagesPaths } from '../../assets/units';
import havenBorder from '../../assets/ui/icon-border-haven.png';
import havenBorderRounded from '../../assets/ui/icon-border-haven-rounded.png';

const { state, sendInput } = useGame();
const { selectedSummon, selectedSkill, targetMode } = useGameUi();

const activePlayer = computed(
  () => state.value.players.find(p => state.value.activeEntity.playerId === p.id)!
);

const onSkillClick = (skill: Skill) => {
  selectedSkill.value = skill;
};

const onSummonClick = (summon: UnitBlueprint) => {
  selectedSummon.value = summon;
};
</script>

<template>
  <div class="action-bar fancy-surface">
    <button
      v-for="skill in state.activeEntity.skills"
      :key="skill.id"
      :disabled="!state.activeEntity.canUseSkill(skill)"
      class="skill"
      :class="targetMode === 'skill' && 'active'"
      :data-cost="skill.cost"
      :style="{
        '--bg': `url(${skillImagesPaths[skill.id]})`,
        '--border': `url(${havenBorder})`
      }"
      @click="selectedSkill = skill"
    />

    <template v-if="state.activeEntity.kind === 'GENERAL'">
      <button
        v-for="unit in activePlayer.summonableUnits"
        :disabled="!activePlayer.canSummon(unit.unit.id)"
        class="summon"
        :class="targetMode === 'summon' && 'active'"
        :data-cost="unit.unit.summonCost"
        :style="{
          '--bg': `url(${unitImagesPaths[unit.unit.id + '-icon']})`,
          '--border': `url(${havenBorderRounded})`
        }"
        @click="selectedSummon = unit.unit"
      />
    </template>

    <UiButton
      :style="{
        '--d-button-bg': 'var(--red-9)',
        '--d-button-hover-bg': 'var(--red-9)',
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
  padding: var(--size-3);

  backdrop-filter: blur(5px);
  border-radius: var(--radius-3);
}

:is(.skill, .summon) {
  position: relative;

  aspect-ratio: 1;
  width: 64px;

  background-image: var(--border), var(--bg);
  background-repeat: no-repeat;
  background-size: cover;
  border: solid 1px var(--primary);

  &::after {
    content: attr(data-cost);

    position: absolute;
    right: -12px;
    bottom: -7px;

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
    opacity: 75%;
    filter: grayscale(75%);
  }
}

.skill {
  width: 64px;
  border-radius: 4px;
}

.summon {
  border-radius: var(--radius-round);
}

.end-turn {
  margin-left: auto;
}
</style>
