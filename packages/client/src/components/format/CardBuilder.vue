<script setup lang="ts">
import { vIntersectionObserver } from '@vueuse/components';
import { camelCase } from 'lodash-es';
import { capitalize } from 'vue';
import {
  CARD_KINDS,
  CARDS,
  FACTIONS,
  KEYWORDS,
  RARITIES,
  type CardBlueprint,
  type CardKind,
  type GameSessionConfig,
  type GenericSerializedBlueprint
} from '@game/sdk';
import { isDefined } from '@game/shared';
import dedent from 'dedent';

import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import { getKeywordById, type Keyword } from '@game/sdk/src/utils/keywords';
import { match } from 'ts-pattern';
import { getTagById, TAGS, type Tag } from '@game/sdk/src/utils/tribes';

const { format } = defineProps<{
  format: {
    cards: Record<string, GenericSerializedBlueprint>;
    config: GameSessionConfig;
  };
  isCustomCard: boolean;
}>();

const blueprint = defineModel<GenericSerializedBlueprint>('card', { required: true });

if (!blueprint.value.cellHighlights) {
  blueprint.value.cellHighlights = [];
}

useFormatProvider(computed(() => format));
const card = ref<CardBlueprint>();
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

const tags = computed(() => blueprint.value.tags.map(getTagById).filter(isDefined));
const tagsOptions = computed(() =>
  Object.values(TAGS)
    .map(tag => ({
      value: tag.id,
      label: capitalize(tag.name),
      item: tag as Tag
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
);

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

const { copy } = useClipboard();

const isSpriteModalOpened = ref(false);

const unitSprites = import.meta.glob('@/assets/units{m}/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const iconSprites = import.meta.glob('@/assets/icons{m}/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});

const hideUsedSprites = ref(true);
const spriteOptions = computed(() => {
  const allCards = [format.cards, ...Object.values(CARDS)];

  const usedSprites = hideUsedSprites.value ? allCards.map(c => c.spriteId) : [];

  return match(blueprint.value.kind)
    .with(CARD_KINDS.GENERAL, CARD_KINDS.MINION, () =>
      Object.keys(unitSprites)
        .map(k => k.replace('/assets/units{m}/', '').split('.')[0])
        .filter(k => {
          return !usedSprites.includes(k);
        })
    )
    .with(CARD_KINDS.SPELL, () =>
      Object.keys(iconSprites)
        .map(k => `icon_${k.replace('/assets/icons{m}/', '').split('.')[0]}`)
        .filter(id => !id.includes('artifact'))
        .filter(k => {
          return !usedSprites.includes(k);
        })
    )
    .with(CARD_KINDS.ARTIFACT, () =>
      Object.keys(iconSprites)
        .map(k => `icon_${k.replace('/assets/icons{m}/', '').split('.')[0]}`)
        .filter(id => id.includes('artifact'))
        .filter(k => {
          return !usedSprites.includes(k);
        })
    )
    .otherwise(() => []);
});

const spriteModalRoot = ref<HTMLElement>();

const visibleSprites = ref(new Set<string>());
const onIntersectionObserver =
  (sprite: string) => (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleSprites.value.add(sprite);
      } else {
        visibleSprites.value.delete(sprite);
      }
    });
  };
const hoveredSprite = ref<string | null>(null);

const getAnimation = (spriteId: string) => {
  return match(blueprint.value.kind)
    .with(CARD_KINDS.GENERAL, CARD_KINDS.MINION, () =>
      hoveredSprite.value === spriteId ? 'attack' : 'breathing'
    )
    .with(CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () =>
      hoveredSprite.value === spriteId ? 'active' : 'default'
    )
    .exhaustive();
};

const copyCode = () => {
  const content = `import { defineSerializedBlueprint } from '../../card-blueprint';

  export const ${camelCase(`${blueprint.value.faction ?? 'neutral'}${blueprint.value.name}`)} = defineSerializedBlueprint(${JSON.stringify(blueprint.value)});
  `;

  copy(dedent(content));
};

watchEffect(() => {
  if (!blueprint.value.targets) {
    blueprint.value.targets = {
      min: 0,
      targets: []
    };
  }
});
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
          <UiButton
            class="primary-button"
            :disabled="!isCustomCard"
            @click="isSpriteModalOpened = true"
          >
            Change Sprite
          </UiButton>

          <UiModal
            v-model:is-opened="isSpriteModalOpened"
            title="Select a sprite"
            style="--ui-modal-size: var(--size-lg)"
          >
            <label>
              <UiSwitch v-model:checked="hideUsedSprites" />
              Hide used sprites
            </label>
            <div ref="spriteModalRoot" class="sprite-modal fancy-scrollbar">
              <div
                v-for="sprite in spriteOptions"
                :key="sprite"
                v-intersection-observer="[
                  onIntersectionObserver(sprite),
                  { root: spriteModalRoot, rootMargin: '500px' }
                ]"
                class="sprite"
                @mouseenter="hoveredSprite = sprite"
                @mouseleave="hoveredSprite = null"
                @click="
                  () => {
                    blueprint.spriteId = sprite;
                    isSpriteModalOpened = false;
                    hoveredSprite = null;
                  }
                "
              >
                <CardSprite
                  v-if="visibleSprites.has(sprite)"
                  :sprite-id="sprite"
                  :animation="getAnimation(sprite)"
                />
              </div>
            </div>
          </UiModal>
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

      <label for="keywords">Tags</label>
      <div v-auto-animate class="flex gap-2 wrap mb-3">
        <div v-for="tag in tags" :key="tag.id" class="keyword">
          {{ tag.name }}

          <UiIconButton
            name="mdi:close"
            type="button"
            @click="
              () => {
                blueprint.tags = blueprint.tags.filter(t => t !== tag.id);
              }
            "
          />
        </div>
      </div>
      <UiCombobox
        v-model="blueprint.tags"
        :options="tagsOptions"
        multiple
        placeholder="Select a tag"
      />

      <h3 class="mt-6">Targets</h3>
      <p>
        These are the targets the player has to choose when playing the card. If some
        targets are optional, adjust the minimum targets as necessary.
      </p>
      <p class="c-orange-5">
        <Icon name="material-symbols:warning-outline" />
        Spells and Artifacts MUST have at least one target or you won't be able to cast
        them ! Furthermore, the first target of an artifact MUST be a general or the card
        won't work.
      </p>
      <TargetsNode v-model="blueprint.targets!" />

      <h3 class="mt-6">Targeting highlights</h3>
      <p>
        Cell highlights have no impact on gameplay and are only used to provide feedback
        to players to show them which cells will be impacted by playing the card. Useful
        for AoEs, etc.
      </p>
      <HighlightsNode v-model="blueprint.cellHighlights!" />

      <h3 class="mt-6">Effects</h3>

      <AccordionRoot type="multiple" collapsible>
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
        <UiButton
          class="primary-button"
          left-icon="material-symbols:add"
          @click="
            blueprint.effects.push({
              text: 'Your effect Text',
              config: {},
              vfx: { tracks: [] }
            })
          "
        >
          New Effect
        </UiButton>
      </AccordionRoot>
      <UiButton
        class="ghost-button"
        left-icon="material-symbols:content-copy-outline"
        @click="copyCode"
      >
        Copy generated code to clipboard
      </UiButton>
    </div>

    <div class="preview">
      <Card
        v-if="card"
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
  grid-template-columns: 1fr auto;
  gap: var(--size-8);

  height: 100%;
  padding-bottom: var(--size-3);
  padding-inline: var(--size-6);
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
  &:has(:focus-visible) {
    outline-color: var(--brand, var(--primary));
    outline-style: solid;
    outline-offset: 5px;
    transition: outline-offset 145ms var(--ease-2);
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

.sprite-modal {
  overflow-x: hidden;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(164px, 1fr));
  gap: var(--size-4);
  justify-items: center;

  height: 500px;

  .sprite {
    width: 96px;
    height: 96px;

    &:hover > .card-sprite {
      filter: brightness(1.5);
    }

    .card-sprite {
      pointer-events: none;

      transform: scale(2);

      aspect-ratio: 1;
      width: 100%;
      height: 100%;

      transition: filter 0.3s;
    }
  }
}
</style>
