<script setup lang="ts">
import {
  CARD_KINDS,
  FACTIONS,
  KEYWORDS,
  RARITIES,
  type CardKind,
  type GameSessionConfig,
  type GenericSerializedBlueprint
} from '@game/sdk';
import { isDefined } from '@game/shared';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import { getKeywordById, type Keyword } from '@game/sdk/src/utils/keywords';
import { capitalize } from 'vue';

const { format } = defineProps<{
  format: {
    cards: Record<string, GenericSerializedBlueprint>;
    config: GameSessionConfig;
  };
  isCustomCard: boolean;
}>();

const blueprint = defineModel<GenericSerializedBlueprint>('card', { required: true });

const card = ref(parseSerializeBlueprint(blueprint.value, format, { noCache: true }));
const error = ref('');
watchEffect(() => {
  try {
    const result = parseSerializeBlueprint(blueprint.value, format, { noCache: true });
    card.value = result;
    error.value = '';
  } catch (err) {
    error.value = (err as Error).message;
  }
});

const roundNumberField = ($event: FocusEvent) => {
  const target = $event.target as HTMLInputElement;
  target.value = `${parseInt(target.value)}`;
};

const raritiesOptions = computed(() =>
  Object.values(RARITIES).map(rarity => ({ value: rarity, label: capitalize(rarity) }))
);

const kindOptions = computed(() =>
  Object.values(CARD_KINDS).map(kind => ({ value: kind, label: capitalize(kind) }))
);

const keywords = computed(() =>
  blueprint.value.keywords.map(getKeywordById).filter(isDefined)
);
const keywordsOptions = computed(() =>
  Object.values(KEYWORDS)
    .map(keyword => ({
      value: keyword.id,
      label: capitalize(keyword.name),
      item: keyword as Keyword
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
);
type UnitBlueprint = GenericSerializedBlueprint & {
  kind: Extract<CardKind, 'MINION' | 'GENERAL'>;
};

const isUnit = (kind: CardKind) =>
  kind === CARD_KINDS.GENERAL || kind === CARD_KINDS.MINION;
watch(
  () => blueprint.value.kind,
  (kind, oldkind) => {
    if (isUnit(kind) && !isUnit(oldkind)) {
      (blueprint.value as UnitBlueprint).attack = 0;
      (blueprint.value as UnitBlueprint).maxHp = 0;
      return;
    }

    if (!isUnit(kind) && isUnit(oldkind)) {
      blueprint.value.attack = undefined;
      blueprint.value.maxHp = undefined;
    }
  }
);
</script>

<template>
  <div class="card-builder fancy-scrollbar">
    <div class="controls">
      <h3>Stats</h3>

      <div :class="!isCustomCard && 'custom-only'">
        <label for="name">Name</label>
        <UiTextInput
          id="name"
          v-model="blueprint.name"
          :readonly="!isCustomCard"
          class="mb-3"
        />
        <div class="flex items-center gap-3">
          <label for="collectable">Appears in collection</label>
          <UiSwitch v-model:checked="blueprint.collectable" :disabled="!isCustomCard" />
          <UiButton :disabled="!isCustomCard">Change Sprite (Soon™)</UiButton>
        </div>

        <p class="c-orange-5 mt-2">
          These informations cann only be edited for custom cards.
        </p>
      </div>

      <div class="split-row">
        <label class="flex flex-col">
          Rarity
          <UiSelect
            v-model="blueprint.rarity"
            :options="raritiesOptions"
            placeholder="Select a rarity"
          />
        </label>
        <label class="flex flex-col">
          kind
          <UiSelect
            v-model="blueprint.kind"
            :options="kindOptions"
            placeholder="Select a rarity"
          />
        </label>
      </div>

      <div class="split-row" style="--cols: 3">
        <div>
          <label for="cost">Cost</label>
          <UiTextInput
            id="cost"
            v-model.number="blueprint.cost"
            type="number"
            step="1"
            @blur="roundNumberField"
          />
        </div>

        <template v-if="isUnit(blueprint.kind)">
          <div>
            <label for="atk">Attack</label>
            <UiTextInput
              id="atk"
              v-model.number="blueprint.attack"
              type="number"
              step="1"
              @blur="roundNumberField"
            />
          </div>

          <div>
            <label for="hp">Health</label>
            <UiTextInput
              id="hp"
              v-model.number="blueprint.maxHp"
              type="number"
              step="1"
              @blur="roundNumberField"
            />
          </div>
        </template>
      </div>

      <fieldset class="factions">
        <legend>Faction</legend>
        <div class="grid grid-cols-4">
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

      <label for="keywords">Keywords</label>
      <div v-auto-animate class="flex gap-2 wrap mb-3">
        <div v-for="keyword in keywords" :key="keyword.id" class="keyword">
          {{ keyword.name }}

          <UiIconButton
            name="mdi:close"
            type="button"
            @click="
              () => {
                blueprint.keywords = blueprint.keywords.filter(k => k !== keyword.id);
              }
            "
          />
        </div>
      </div>
      <UiCombobox
        v-model="blueprint.keywords"
        :options="keywordsOptions"
        multiple
        placeholder="Select a keyword"
      >
        <template #option="{ option }">
          <div>
            <div class="font-500">{{ option.item?.name }}</div>
            <div class="text-0">{{ option.item?.description }}</div>
          </div>
        </template>
      </UiCombobox>
      <p class="c-orange-5">
        Adding a keyword does not implement its effect. Use this in conjunction with the
        effect builder below.
      </p>

      <h3 class="mt-6">Effects</h3>

      <AccordionRoot type="single" collapsible>
        <AccordionItem
          v-for="(effect, index) in blueprint.effects"
          :key="index"
          :value="`${index}`"
          class="my-3"
        >
          <AccordionHeader as="div" class="effect-header">
            <UiIconButton
              name="material-symbols:delete-outline"
              class="error-button"
              type="button"
              @click="blueprint.effects.splice(index, 1)"
            >
              Delete
            </UiIconButton>
            <AccordionTrigger>
              <TextWithKeywords :text="effect.text" :highlighted="false" />
              <Icon name="mdi:chevron-down" class="chevron" />
            </AccordionTrigger>
          </AccordionHeader>

          <AccordionContent class="accordion-content">
            <EffectBuilder
              v-model:effect="blueprint.effects[index]"
              :blueprint="blueprint"
            />
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </div>
    <div class="preview">
      <Card
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
          tags: card.tags ?? [],
          keywords: keywords
        }"
      />

      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.card-builder {
  overflow: auto;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--size-2);

  height: 100%;
  padding-bottom: var(--size-3);
}

h3 {
  margin-bottom: var(--size-5);
}

.custom-only {
  padding: var(--size-4);
  border: solid 1px var(--border-dimmed);
}

.preview {
  position: sticky;
  top: 0;
  align-self: start;
  justify-self: center;
}

.factions label {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  padding-block: var(--size-2);
  img {
    aspect-ratio: 1;
    width: 48px;
  }
  &:has(input:checked) {
    color: var(--primary);
    img {
      filter: drop-shadow(3px 3px 0 var(--cyan-5))
        drop-shadow(-3px -3px 0 var(--orange-5));
    }
  }
}

.split-row {
  --cols: 2;

  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: var(--size-3);
}

.controls > label {
  display: block;
}

.controls > label:not(:first-of-type),
.controls > fieldset,
.split-row {
  margin-block: var(--size-6) var(--size-3);
}

.keyword {
  --ui-button-bg: transparent;
  --ui-button-hover-bg: hsl(var(--color-error-hover-hsl) / 0.2);
  --ui-button-color: var(--error);

  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding: var(--size-1) var(--size-1) var(--size-1) var(--size-3);

  color: var(--text-on-primary);

  background-color: var(--primary);
  border-radius: var(--radius-pill);
}

.error {
  padding: var(--size-3);
  color: var(--error);
  background-color: hsl(var(--color-error-hsl) / 0.25);
}

.effect-header {
  display: flex;
  gap: var(--size-3);

  padding: var(--size-3);

  border: solid var(--border-size-1) var(--border);
  border-radius: var(--size-1);
}
</style>
