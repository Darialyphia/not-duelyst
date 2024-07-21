<script setup lang="ts">
import {
  CARD_KINDS,
  FACTIONS,
  type GameSessionConfig,
  type GenericSerializedBlueprint
} from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';

const { format } = defineProps<{
  format: {
    cards: Record<string, GenericSerializedBlueprint>;
    config: GameSessionConfig;
  };
  isCustomCard: boolean;
}>();

const blueprint = defineModel<GenericSerializedBlueprint>('card', { required: true });

const card = computed(() =>
  parseSerializeBlueprint(blueprint.value, format, { noCache: true })
);

const roundNumberField = ($event: FocusEvent) => {
  const target = $event.target as HTMLInputElement;
  target.value = `${parseInt(target.value)}`;
};
</script>

<template>
  <div class="card-builder fancy-scrollbar">
    <div>
      <label for="name">Name</label>
      <UiTextInput id="name" v-model="blueprint.name" :readonly="isCustomCard" />
      <p class="c-orange-5">Cannot edit name of standard cards</p>

      <label for="cost">Cost</label>
      <UiTextInput
        id="cost"
        v-model.number="blueprint.cost"
        type="number"
        step="1"
        @blur="roundNumberField"
      />

      <template
        v-if="
          blueprint.kind === CARD_KINDS.GENERAL || blueprint.kind === CARD_KINDS.MINION
        "
      >
        <label for="atk">Attack</label>
        <UiTextInput
          id="atk"
          v-model.number="blueprint.attack"
          type="number"
          step="1"
          @blur="roundNumberField"
        />

        <label for="hp">Health</label>
        <UiTextInput
          id="hp"
          v-model.number="blueprint.maxHp"
          type="number"
          step="1"
          @blur="roundNumberField"
        />

        <fieldset class="factions">
          <legend>Faction</legend>
          <div class="grid grid-cols-3">
            <label v-for="faction in FACTIONS" :key="faction.id">
              <img :src="`/assets/ui/icon_${faction.id}.png`" />
              <input
                v-model="blueprint.faction"
                type="radio"
                class="sr-only"
                :value="faction.id"
              />
              {{ faction.name }}
            </label>
            <label>
              <img src="/assets/ui/icon_neutral.png" />
              Neutral
              <input
                :checked="blueprint.faction === null"
                type="radio"
                class="sr-only"
                @change="blueprint.faction = null"
              />
            </label>
          </div>
        </fieldset>
      </template>
    </div>
    <Card
      class="preview"
      :card="{
        blueprintId: card.id,
        name: card.name,
        description: card.description,
        kind: card.kind,
        spriteId: card.spriteId,
        rarity: card.rarity,
        attack: card.attack,
        hp: card.maxHp,
        speed: card.speed,
        cost: card.cost,
        faction: card.faction,
        tags: card.tags ?? []
      }"
    />
  </div>
</template>

<style scoped lang="postcss">
.card-builder {
  overflow: auto;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--size-2);

  height: 100%;
}

.preview {
  position: sticky;
  top: 0;
  align-self: start;
}

.factions label {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  align-items: center;

  &:has(input:checked) {
    color: var(--primary);
    img {
      filter: drop-shadow(3px 3px 0 var(--cyan-5))
        drop-shadow(-3px -3px 0 var(--orange-5));
    }
  }
}
</style>
