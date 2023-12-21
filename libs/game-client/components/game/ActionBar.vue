<script setup lang="ts">
import { skillImagesPaths } from '../../assets/skills';
import { unitImagesPaths } from '../../assets/units';
import { exhaustiveSwitch } from '@hc/shared';

import havenBorder from '../../assets/ui/icon-border-haven.png';
import havenBorderRounded from '../../assets/ui/icon-border-haven-rounded.png';
import chaosBorder from '../../assets/ui/icon-border-chaos.png';
import chaosBorderRounded from '../../assets/ui/icon-border-chaos-rounded.png';

const { state, sendInput, fx } = useGame();
const { selectedSummon, selectedSkill } = useGameUi();

const activePlayer = computed(
  () => state.value.players.find(p => state.value.activeEntity.playerId === p.id)!
);

const borders = computed(() => {
  switch (state.value.activeEntity.unit.faction.id) {
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
  <div class="action-bar content-surface">
    <button
      class="active-entity"
      :style="{
        '--bg': `url(${unitImagesPaths[state.activeEntity.unit.spriteId + '-icon']})`,
        '--border': `url(${borders.square})`
      }"
      @click="
        () => {
          const spriteRef = fx.spriteMap.get(state.activeEntity.id);
          if (!spriteRef) return;
          const sprite = toValue(spriteRef);
          if (!sprite) return;

          fx.viewport?.moveCenter(sprite.position);
        }
      "
    />

    <UiTooltip
      v-for="skill in state.activeEntity.skills"
      :key="skill.id"
      :side-offset="50"
      :delay="200"
    >
      <template #trigger>
        <button
          :disabled="!state.activeEntity.canUseSkill(skill)"
          class="skill"
          :class="{
            active: selectedSkill?.id === skill.id,
            unavailable:
              state.activeEntity.ap < skill.cost ||
              state.activeEntity.hasEffect('meditating')
          }"
          :data-cost="skill.cost"
          :data-cooldown="
            state.activeEntity.skillCooldowns[skill.id] > 0
              ? state.activeEntity.skillCooldowns[skill.id]
              : ''
          "
          :style="{
            '--bg': `url(${skillImagesPaths[skill.id]})`,
            '--border': `url(${borders.square})`,
            '--cooldown-angle':
              360 - (360 * state.activeEntity.skillCooldowns[skill.id]) / skill.cooldown
          }"
          @click="selectedSkill = skill"
        />
      </template>

      <div class="fancy-surface">{{ skill.getDescription(state.activeEntity) }}</div>
    </UiTooltip>

    <template v-if="state.activeEntity.kind === 'GENERAL'">
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
              unavailable:
                state.activeEntity.ap < unit.unit.summonCost ||
                state.activeEntity.hasEffect('meditating')
            }"
            :data-cost="unit.unit.summonCost"
            :data-cooldown="unit.cooldown > 0 ? unit.cooldown : ''"
            :style="{
              '--cooldown-angle': 360 - (360 * unit.cooldown) / unit.unit.summonCooldown,
              '--bg': `url(${unitImagesPaths[unit.unit.spriteId + '-icon']})`,
              '--border': `url(${borders.rounded})`
            }"
            @click="selectedSummon = unit.unit"
          />
        </template>
        <UnitBlueprintCard :unit="unit.unit" />
      </UiTooltip>
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

.active-entity {
  width: 96px;
}

:is(.skill, .summon, .active-entity) {
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

.end-turn {
  margin-left: auto;
}
</style>
