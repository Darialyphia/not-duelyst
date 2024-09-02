<script setup lang="ts">
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import { FACTIONS, type CardBlueprint, type Faction } from '@game/sdk';
import type { Nullable } from '@game/shared';
import type { CostFilter } from '~/composables/useCollection';

const { general } = defineProps<{ general: Nullable<CardBlueprint> }>();

const listMode = defineModel<'cards' | 'compact'>('listMode', { required: true });
const filter = defineModel<Faction | null | undefined>('filter', { required: true });
const search = defineModel<Nullable<string>>('search', { required: true });
const cost = defineModel<Nullable<CostFilter>>('cost', { required: true });
const selectedFormatId = defineModel<Id<'formats'> | undefined>('selectedFormatId', {
  required: true
});

const { isMobile } = useResponsive();
const factions = Object.values(FACTIONS);

const isFilterPopoverOpened = ref(false);
const isMobileFilterDrawerOpened = ref(false);
</script>

<template>
  <header class="fancy-surface border-none">
    <BackButton class="flex-self-center" />
    <div class="flex flex-1 gap-1">
      <InteractableSounds v-for="faction in factions" :key="faction.id">
        <button
          class="faction"
          :class="filter?.equals(faction) && 'active'"
          :disabled="!!general && !general?.faction?.equals(faction)"
          @click="
            () => {
              if (filter?.equals(faction)) {
                filter = undefined;
              } else {
                filter = faction;
              }
            }
          "
        >
          {{ faction.name }}
        </button>
      </InteractableSounds>
      <InteractableSounds>
        <button
          class="faction"
          :class="filter === null && 'active'"
          @click="
            () => {
              if (filter === null) {
                filter = undefined;
              } else {
                filter = null;
              }
            }
          "
        >
          Neutral
        </button>
      </InteractableSounds>

      <PopoverRoot v-if="!isMobile" v-model:open="isFilterPopoverOpened">
        <PopoverTrigger as-child>
          <UiButton class="ml-auto mr-3 ghost-button">Filters</UiButton>
        </PopoverTrigger>
        <PopoverAnchor />

        <PopoverPortal>
          <PopoverContent as-child :collision-padding="20">
            <div class="fancy-surface">
              <fieldset>
                <legend>Cost</legend>
                <div class="grid grid-cols-5 gap-1">
                  <button
                    v-for="i in 9"
                    :key="i"
                    class="cost"
                    :class="cost === i - 1 && 'active'"
                    @click="
                      () => {
                        if (cost === i - 1) {
                          cost = null;
                        } else {
                          cost = (i - 1) as CostFilter;
                        }
                      }
                    "
                  >
                    {{ i === 9 ? '8+' : i - 1 }}
                  </button>
                </div>
              </fieldset>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>

      <template v-if="isMobile">
        <UiIconButton
          class="ghost-button ml-auto"
          name="game-icons:settings-knobs"
          :style="{ '--ui-icon-button-size': 'var(--font-size-4)' }"
          @click="isMobileFilterDrawerOpened = true"
        />
        <UiIconButton
          class="ghost-button"
          name="material-symbols-light:view-column-2"
          :style="{
            '--ui-icon-button-size': 'var(--font-size-4)',
            '--ui-button-color': listMode === 'cards' ? 'var(--primary)' : undefined,
            '--ui-button-border-color':
              listMode === 'cards' ? 'var(--primary)' : undefined
          }"
          @click="listMode = 'cards'"
        />
        <UiIconButton
          class="ghost-button"
          name="heroicons:squares-2x2-16-solid"
          :style="{
            '--ui-icon-button-size': 'var(--font-size-4)',
            '--ui-button-color': listMode === 'compact' ? 'var(--primary)' : undefined,
            '--ui-button-border-color':
              listMode === 'compact' ? 'var(--primary)' : undefined
          }"
          @click="listMode = 'compact'"
        />
      </template>

      <FormatSelector v-model="selectedFormatId" />
      <UiTextInput
        id="collection-search"
        v-model="search"
        class="search"
        placeholder="Search by name, keyword..."
        left-icon="material-symbols:search"
      />
    </div>
    <UiDrawer v-model:is-opened="isMobileFilterDrawerOpened" direction="left" size="xs">
      <h4>Faction</h4>
      <div class="flex gap-2 flex-wrap">
        <InteractableSounds v-for="faction in factions" :key="faction.id">
          <button
            class="faction"
            :class="filter?.equals(faction) && 'active'"
            :disabled="!!general && !general?.faction?.equals(faction)"
            :style="{ '--bg': `url(/assets/ui/icon_${faction.id}.png)` }"
            @click="
              () => {
                if (filter?.equals(faction)) {
                  filter = undefined;
                } else {
                  filter = faction;
                }
              }
            "
          />
        </InteractableSounds>
        <InteractableSounds>
          <button
            class="faction"
            :class="filter === null && 'active'"
            :style="{ '--bg': `url(/assets/ui/icon_neutral.png)` }"
            @click="
              () => {
                if (filter === null) {
                  filter = undefined;
                } else {
                  filter = null;
                }
              }
            "
          />
        </InteractableSounds>
      </div>
      <h4>Cost</h4>

      <div class="grid grid-cols-5 gap-1">
        <button
          v-for="i in 9"
          :key="i"
          class="cost"
          :class="cost === i - 1 && 'active'"
          @click="
            () => {
              if (cost === i - 1) {
                cost = null;
              } else {
                cost = (i - 1) as CostFilter;
              }
            }
          "
        >
          {{ i === 9 ? '8+' : i - 1 }}
        </button>
      </div>
    </UiDrawer>
  </header>
</template>

<style scoped lang="postcss">
header {
  display: flex;
  gap: var(--size-8);
  padding: var(--size-2) var(--size-6);
  box-shadow: none;

  @screen lt-lg {
    position: fixed;
    z-index: 1;
    top: 0;

    width: calc(100% - var(--sidebar-width));

    background: transparent;
    backdrop-filter: blur(5px);
  }
}

.faction {
  cursor: pointer;
  user-select: none;

  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding: var(--size-2);

  font-weight: var(--font-weight-5);
  text-transform: capitalize;

  @screen lt-xl {
    aspect-ratio: 1;
    width: 64px;
    background: var(--bg);
    background-size: contain;
    header > div > & {
      display: none;
    }
  }

  &:hover:not(:disabled) {
    color: var(--primary);
  }

  &:disabled {
    opacity: 0.5;
  }

  &.active {
    @screen lt-lg {
      filter: drop-shadow(0 0 10px hsl(var(--color-primary-hsl) / 0.5))
        drop-shadow(3px 3px 0 var(--cyan-5)) drop-shadow(-3px -3px 0 var(--orange-5));
      transition: filter 0.3s;
    }

    @screen lg {
      border-bottom: solid var(--border-size-1) var(--primary);
    }
  }

  img {
    transition: transform 0.2s;
  }
}

.cost {
  cursor: pointer;
  user-select: none;

  display: block;
  display: grid;
  place-items: center;

  aspect-ratio: 1;
  width: 40px;
  height: 40px;
  margin-inline: var(--size-1);

  color: black;

  background-image: url('/assets/ui/card-cost.png');
  background-size: cover;
  filter: grayscale(35%);

  transition: filter 0.3s;

  &.active {
    filter: drop-shadow(2px 2px 0 var(--cyan-5)) drop-shadow(-2px -2px 0 var(--orange-5));
  }
}

.divider {
  display: block;

  width: 1px;
  height: 100%;
  margin-inline: var(--size-4);

  background-color: var(--border);
}

.search {
  margin-left: var(--size-4);
  padding-left: var(--size-2);
  border-radius: var(--radius-pill);
}
</style>
