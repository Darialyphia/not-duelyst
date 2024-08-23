<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';

const { loadouts } = defineProps<{ loadouts: LoadoutDto[] }>();
const isEditing = defineModel<boolean>('isEditingLoadout', { required: true });
const { initFromCode, initFromLoadout, initEmpty } = useLoadoutForm();

const editLoadout = (loadout: LoadoutDto) => {
  initFromLoadout(loadout);
  isEditing.value = true;
};
</script>

<template>
  <section class="collection-sidebar">
    <template v-if="isEditing">
      <LoadoutForm
        @back="isEditing = false"
        @import-code="
          () => {
            initFromCode;
            isEditing = true;
          }
        "
      />
    </template>

    <template v-else>
      <p v-if="!loadouts?.length" class="py-3 text-center">
        You don't have any loadout yet
      </p>

      <ul v-if="loadouts" v-auto-animate>
        <Sound
          v-for="loadout in loadouts"
          :key="loadout._id"
          sound="button-hover"
          :triggers="['mouseenter']"
        >
          <li class="m-2 relative">
            <CollectionLoadoutCard
              :loadout="loadout"
              @edit="
                () => {
                  initFromLoadout(loadout);
                  isEditing = true;
                }
              "
            />
          </li>
        </Sound>
      </ul>

      <UiFancyButton
        class="primary-button mx-auto"
        left-icon="material-symbols:add"
        @click="
          () => {
            initEmpty();
            isEditing = true;
          }
        "
      >
        New Deck
      </UiFancyButton>
    </template>
  </section>
</template>

<style scoped lang="postcss">
.collection-sidebar {
  will-change: transform;

  grid-column: 2;
  grid-row: 1 / -1;

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
</style>
