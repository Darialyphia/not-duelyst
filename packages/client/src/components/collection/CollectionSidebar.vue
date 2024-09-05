<script setup lang="ts">
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import type { GameFormatDto } from '@game/api/src/convex/formats/format.mapper';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import type { Nullable } from '@game/shared';

const { loadouts } = defineProps<{
  loadouts: LoadoutDto[];
  format: Pick<GameFormatDto, 'cards' | 'config'>;
}>();
const isEditing = defineModel<boolean>('isEditingLoadout', { required: true });

const { initFromCode, initFromLoadout, initEmpty } = useLoadoutForm();

const editLoadout = (loadout: LoadoutDto) => {
  initFromLoadout(loadout);
  isEditing.value = true;
};

const importCode = ref('');
const isPopoverOpened = ref(false);
const onImport = () => {
  initFromCode(importCode.value);
  isEditing.value = true;
};
</script>

<template>
  <section class="collection-sidebar">
    <LoadoutForm
      v-if="isEditing"
      :format="format"
      @back="isEditing = false"
      @import-code="
        () => {
          initFromCode;
          isEditing = true;
        }
      "
    />

    <template v-else>
      <p v-if="!loadouts?.length" class="py-3 text-center">
        You don't have any loadout yet
      </p>

      <ul v-if="loadouts" v-auto-animate>
        <InteractableSounds v-for="loadout in loadouts" :key="loadout._id">
          <li class="m-2 relative">
            <CollectionLoadoutCard :loadout="loadout" @edit="editLoadout(loadout)" />
          </li>
        </InteractableSounds>
      </ul>

      <PopoverRoot v-model:open="isPopoverOpened">
        <div class="primary-button create-button-wrapper">
          <InteractableSounds>
            <UiButton
              left-icon="material-symbols:add"
              @click="
                () => {
                  initEmpty();
                  isEditing = true;
                }
              "
            >
              New Deck
            </UiButton>
          </InteractableSounds>
          <PopoverTrigger as-child>
            <UiIconButton name="tdesign:caret-down" @click="isPopoverOpened = true" />
          </PopoverTrigger>
        </div>
        <PopoverAnchor />

        <PopoverPortal>
          <PopoverContent as-child :collision-padding="20" :align-offset="20">
            <div class="fancy-surface">
              <div class="flex mt-2 gap-4 items-center">
                <UiTextInput
                  id="import-code"
                  v-model="importCode"
                  placeholder="Import deck"
                />
                <InteractableSounds>
                  <UiIconButton
                    class="primary-button"
                    name="solar:import-linear"
                    type="button"
                    @click="onImport"
                  />
                </InteractableSounds>
              </div>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </template>
  </section>
</template>

<style scoped lang="postcss">
.collection-sidebar {
  will-change: transform;

  background: var(--fancy-bg);
  background-blend-mode: overlay;
  border-left: var(--fancy-border);

  transition: transform 0.7s;
  transition-delay: 0.3s;
  transition-timing-function: var(--ease-bounce-1);

  @screen lt-lg {
    overflow-x: hidden;
    height: 100dvh;
  }
}

.create-button-wrapper {
  --ui-button-radius: var(--radius-2);
  --ui-icon-button-radius: var(--radius-2);

  display: flex;
  justify-content: center;
  > button:first-of-type {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  > button:last-of-type {
    border-left: solid var(--border-size-1) hsl(from var(--primary) h s 30%);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
