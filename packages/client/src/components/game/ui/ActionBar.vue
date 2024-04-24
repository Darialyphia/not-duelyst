<script setup lang="ts">
const { dispatch, ui } = useGame();

const hand = useGameSelector(session => session.playerSystem.activePlayer.hand);
</script>

<template>
  <div v-if="ui.selectedEntity.value" class="skill-bar">
    <UiTooltip
      v-for="(skill, index) in ui.selectedEntity.value.skills"
      :key="skill.id"
      :side-offset="20"
      :delay="200"
    >
      <template #trigger>
        <button
          :class="{
            active: ui.selectedSkill.value?.id === skill.id,
            unavailable: !ui.selectedEntity.value?.canUseSkill(skill)
          }"
          :disabled="!ui.selectedEntity.value?.canUseSkill(skill)"
          :data-remaining-cooldown="
            skill.currentCooldown > 0 ? skill.currentCooldown : ''
          "
          :data-cooldown="skill.cooldown"
          :style="{
            '--cooldown-angle': 360 - (360 * skill.currentCooldown) / skill.cooldown,
            '--bg': `url('/assets/icons/${skill.blueprint.iconId}.png')`
          }"
          @click="ui.selectSkillAtIndex(index)"
        />
      </template>

      <div class="fancy-surface skill-tooltip">
        <h4>{{ skill.name }}</h4>
        <p>{{ skill.description }}</p>
      </div>
    </UiTooltip>
  </div>

  <div class="action-bar">
    <div class="flex gap-5 iems-center">
      <ActionBarItem
        v-for="(card, index) in hand"
        :key="`${card?.blueprintId}:${index}`"
        :index="index"
      />
    </div>
    <UiFancyButton
      :style="{ '--hue': '10DEG', '--hue2': '20DEG', 'min-width': '10ch' }"
      @click="
        () => {
          dispatch('endTurn');
          ui.unselectCard();
          ui.unselectEntity();
        }
      "
    >
      End turn
    </UiFancyButton>
  </div>
</template>

<style scoped lang="postcss">
.action-bar {
  position: absolute;
  bottom: var(--size-5);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-5);
  align-items: center;

  width: var(--size-lg);

  button {
    align-self: stretch;
    border-radius: var(--radius-round);
  }
}

.skill-bar {
  position: absolute;
  bottom: var(--size-11);
  left: 50%;
  transform: translateX(-50%);

  width: var(--size-lg);

  button {
    position: relative;

    aspect-ratio: 1;
    width: 64px;

    background-image: var(--bg);
    background-repeat: no-repeat;
    background-size: cover;

    @screen lt-lg {
      width: 48px;
    }

    &::after {
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
    }

    &.active {
      box-shadow: 0 0 1px 2px var(--primary);
    }

    &:disabled {
      cursor: not-allowed;

      &::before {
        content: attr(data-remaining-cooldown);

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
        border-radius: 50%;
      }

      &.unavailable {
        filter: grayscale(70%) brightness(60%) contrast(110%);
      }
    }
  }
}
</style>
