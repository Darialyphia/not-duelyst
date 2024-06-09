<script setup lang="ts">
import { FACTIONS } from '@game/sdk';

const { ui, gameType, dispatch } = useGame();
const player = useUserPlayer();
</script>

<template>
  <div v-if="gameType !== GAME_TYPES.SPECTATOR" class="action-wheel">
    <InteractableSounds v-for="faction in FACTIONS" :key="faction.id">
      <button
        :disabled="!player.canPerformResourceAction"
        class="rune"
        :style="{ '--bg': `url('/assets/ui/rune-${faction.id}.png')` }"
        @click="dispatch('addRune', { factionId: faction.id })"
      >
        <span class="sr-only">{{ faction.name }}</span>
      </button>
    </InteractableSounds>

    <InteractableSounds>
      <button
        class="draw"
        :disabled="!player.canPerformResourceAction"
        @click="dispatch('draw')"
      >
        <span class="sr-only">draw</span>
      </button>
    </InteractableSounds>

    <template v-if="ui.selectedEntity.value">
      <UiTooltip
        v-for="(skill, index) in ui.selectedEntity.value.skills"
        :key="skill.id"
        :side-offset="200"
        :delay="200"
      >
        <template #trigger>
          <InteractableSounds>
            <button
              class="skill"
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
          </InteractableSounds>
        </template>

        <div class="fancy-surface skill-tooltip">
          <h4>{{ skill.name }}</h4>
          <p>
            <TextWithKeywords :text="skill.description" />
          </p>
        </div>
      </UiTooltip>
    </template>
  </div>
</template>

<style scoped lang="postcss">
.action-wheel {
  position: absolute;
  right: var(--size-5);
  bottom: var(--size-11);
  transform: translateX(-50%);

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: var(--size-12);
  > * {
    --step: calc(360 / 8);
    --angle: calc((var(--step) * var(--index) - (90 * 0.98)) * 1deg);
    --index: calc(var(--child-index) - 1);

    transform: rotateZ(var(--angle)) translateY(calc(-1 * var(--size-10)))
      rotateZ(calc(-1 * var(--angle)));

    grid-column: 1;
    grid-row: 1;

    aspect-ratio: 1;

    transition: filter 0.3s;
    &:hover {
      filter: drop-shadow(0 0 0.5em white) drop-shadow(4px 4px 0 var(--cyan-5))
        drop-shadow(-4px -4px 0 var(--orange-5));
    }
  }
}

.rune {
  aspect-ratio: 1;
  width: 48px;

  background: var(--bg);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;

  &:disabled {
    filter: grayscale(70%) brightness(60%) contrast(110%);
  }
}

.skill {
  position: relative;

  aspect-ratio: 1;
  width: 48px;

  background-image: var(--bg);
  background-repeat: no-repeat;
  background-size: cover;

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
.skill-tooltip {
  max-width: var(--size-13);
}

.draw {
  aspect-ratio: 1;
  width: 48px;

  background: url('/assets/icons/draw.png');
  background-repeat: no-repeat;
  background-size: cover;

  &:disabled {
    filter: grayscale(70%) brightness(60%) contrast(110%);
  }
}
</style>
