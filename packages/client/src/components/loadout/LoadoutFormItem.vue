<script setup lang="ts">
import { type CardBlueprint } from '@game/sdk';

const { group, isFlashing } = defineProps<{
  group: {
    card: CardBlueprint;
    copies: number;
    id: string;
    pedestalId: string;
    cardBackId: string;
  };
  isFlashing: boolean;
}>();

const emit = defineEmits<{ 'flash:end': []; select: [] }>();
const { removeCard } = useLoadoutForm();
</script>

<template>
  <HoverCardRoot :open-delay="0" :close-delay="0">
    <HoverCardTrigger as-child>
      <li
        :class="[group.card.kind.toLowerCase(), isFlashing && 'flash']"
        @click="removeCard(group.card.id)"
        @animationend="emit('flash:end')"
      >
        <div class="cost">
          {{ group.card.cost }}
        </div>

        <div class="name">
          <template v-if="group.copies > 1">X {{ group.copies }}</template>
          {{ group.card.name }}
        </div>

        <div class="flex items-center ml-auto" style="aspect-ratio: 1; width: 64px">
          <CardSprite
            :sprite-id="group.card.spriteId"
            class="h-full w-full card-sprite"
          />
        </div>
      </li>
    </HoverCardTrigger>

    <HoverCardPortal>
      <HoverCardContent :side-offset="5" side="left" align="center" class="relative">
        <Card
          :card="{
            blueprintId: group.card.id,
            name: group.card.name,
            description: group.card.description,
            kind: group.card.kind,
            spriteId: group.card.spriteId,
            rarity: group.card.rarity,
            attack: group.card.attack,
            hp: group.card.maxHp,
            speed: group.card.speed,
            cost: group.card.cost,
            faction: group.card.faction,
            tags: group.card.tags ?? [],
            pedestalId: group.pedestalId,
            cardbackId: group.cardBackId
          }"
        />
        <UiIconButton
          class="ghost-button cosmetics-toggle"
          name="mdi:palette"
          @click="emit('select')"
        />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
@keyframes loadout-card-flash {
  50% {
    transform: scale(1.03);
    filter: brightness(200%) drop-shadow(0 0 6px white);
  }
}

li {
  cursor: pointer;
  user-select: none;

  overflow: hidden;
  display: flex;
  gap: var(--size-2);
  align-items: center;

  height: 72px;

  @screen lt-lg {
    height: 64px;
  }

  font-size: var(--font-size-3);

  border-bottom: solid var(--border-size-1) var(--border-dimmed);

  &:hover {
    filter: brightness(120%);
  }
  &.general .cost {
    visibility: hidden;
  }

  &.flash {
    animation: loadout-card-flash 0.3s;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > .rune {
    width: 18px;
    height: 20px;
  }

  > button {
    padding: var(--size-1);
    font-size: var(--font-size-0);
    border-radius: var(--radius-round);
    box-shadow: inset 0 0 3px 4px rgba(0, 0, 0, 0.35);
  }
}

.cost {
  transform: translateY(4px);

  display: grid;
  place-content: center;

  width: var(--size-7);
  height: var(--size-7);
  padding: var(--size-1);

  font-size: var(--font-size-1);
  color: black;

  background-image: url('/assets/ui/card-cost.png');
  background-size: cover;
}

.name {
  overflow: hidden;
  display: grid;
  align-items: center;
  align-self: stretch;

  margin-top: var(--size-2);

  font-size: var(--font-size-1);
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cosmetics-toggle {
  --ui-icon-button-size: var(--size-7);

  position: absolute;
  right: 0;
  bottom: calc(-1 * var(--size-3));
}

:is(.general, .minion) .card-sprite {
  transform: translateY(8px);
}
:is(.spell, .artifact) .card-sprite {
  @screen lg {
    transform: translateY(-8px);
  }
}
</style>
