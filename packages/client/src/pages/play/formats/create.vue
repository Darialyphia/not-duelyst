<script setup lang="ts">
import { api } from '@game/api';
import { defaultConfig } from '@game/sdk';

definePageMeta({
  name: 'CreateFormat',
  pageTransition: {
    name: 'create-format-page',
    mode: 'out-in',
    appear: true
  }
});

const { VERSION, ...config } = defaultConfig;
const form = reactive({
  name: 'My new format',
  description: 'Format description',
  config: {
    ...config
  }
});

const { isLoading, mutate: createFormat } = useConvexAuthedMutation(api.formats.create);
</script>

<template>
  <div class="page container pt-8 px-5" style="--container-size: var(--size-md)">
    <header>
      <BackButton />
      <h1>New Format</h1>
    </header>

    <form
      class="fancy-surface fancy-scrollbar flex flex-col gap-4"
      @submit.prevent="createFormat(form)"
    >
      <div>
        <Label for="name">Name</Label>
        <UiTextInput id="name" v-model="form.name" />
      </div>
      <div>
        <Label for="description">Description</Label>
        <textarea id="description" v-model="form.description" />
      </div>

      <fieldset>
        <legend>Deck</legend>
        <label for="deck_size">Deck size</label>
        <UiTextInput
          id="deck_size"
          v-model.number="form.config.MAX_DECK_SIZE"
          type="number"
        />

        <label for="deck_size">Max card copies</label>
        <UiTextInput
          id="deck_size"
          v-model.number="form.config.MAX_COPIES_PER_CARD"
          type="number"
        />
      </fieldset>

      <fieldset>
        <legend>Cards</legend>

        <label for="max_hand_size">Max hand size</label>
        <UiTextInput
          id="max_hand_size"
          v-model.number="form.config.MAX_HAND_SIZE"
          type="number"
        />

        <label for="draw_per_turn">Card draw per turn</label>
        <UiTextInput
          id="max_draw_per_turn"
          v-model.number="form.config.CARD_DRAW_PER_TURN"
          type="number"
        />

        <label for="replaces">Replaces per turn</label>
        <UiTextInput
          id="replaces"
          v-model.number="form.config.MAX_REPLACES_PER_TURN"
          type="number"
        />

        <label for="starting_hand_size">Starting hand size</label>
        <UiTextInput
          id="satarting_hand_size"
          v-model.number="form.config.STARTING_HAND_SIZE"
          type="number"
        />
      </fieldset>

      <fieldset>
        <legend>Gold</legend>

        <label for="max_gold">Max gold</label>
        <UiTextInput id="max_gold" v-model.number="form.config.MAX_GOLD" type="number" />

        <label for="refill_mana">Refill player gold at the start of their turn</label>
        <UiSwitch id="refill_mana" v-model:checked="form.config.REFILL_GOLD_EVERY_TURN" />

        <label for="gold_per_turn">Gold gained per turn</label>
        <UiTextInput
          id="gold_per_turn"
          v-model.number="form.config.GOLD_PER_TURN"
          type="number"
        />
        <p class="text-0 color-orange-5">
          This has no effect when "Refill player gold" is enabled.
        </p>

        <label for="max_gold_increase">Max gold increase per turn</label>
        <UiTextInput
          id="max_gold_increase"
          v-model.number="form.config.MAX_GOLD_INCREASE_PER_TURN"
          type="number"
        />

        <label for="p1_gold">Player 1 starting gold</label>
        <UiTextInput
          id="p1_gold"
          v-model.number="form.config.PLAYER_1_STARTING_GOLD"
          type="number"
        />

        <label for="p1_gold">Player 2 starting gold</label>
        <UiTextInput
          id="p1_gold"
          v-model.number="form.config.PLAYER_2_STARTING_GOLD"
          type="number"
        />
      </fieldset>

      <fieldset>
        <legend>Units</legend>
        <label for="can_move_after_attacking">Units can move after attacking</label>
        <UiSwitch
          id="can_move_after_attacking"
          v-model:checked="form.config.CAN_MOVE_AFTER_ATTACK"
        />

        <label for="can_walk_through_allies">Units can move through allies</label>
        <UiSwitch
          id="can_walk_through_allies"
          v-model:checked="form.config.CAN_WALK_THROUGH_ALLIES"
        />

        <label for="unlimited_retal">Units always counterattack</label>
        <UiSwitch
          id="unlimited_retal"
          v-model:checked="form.config.UNLIMITED_RETALIATION"
        />
        <p>Otherwise, they counterattack at most once per turn.</p>

        <label for="unit_speed">Base unit speed</label>
        <UiTextInput
          id="satarting_hand_size"
          v-model.number="form.config.UNIT_DEFAULT_SPEED"
          type="number"
        />
      </fieldset>

      <fieldset>
        <legend>Artifacts</legend>
        <label for="unit_speed">Artifact_durability</label>
        <UiTextInput
          id="satarting_hand_size"
          v-model.number="form.config.ARTIFACT_DURABILITY"
          type="number"
        />
      </fieldset>

      <UiFancyButton v-model="form.description">Create</UiFancyButton>
    </form>
  </div>
</template>

<style lang="postcss">
.create-format-pagee-enter-active,
.create-format-page-leave-active {
  transition: all 0.3s;
}
.create-format-page-enter-from,
.create-format-page-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>
<style scoped lang="postcss">
.page {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  > header {
    text-shadow: black 0px 4px 1px;
  }
}

textarea {
  resize: none;

  width: 100%;

  background-color: var(--surface-1);
  border: solid 1px var(--border-dimmed);
  border-radius: var(--radius-1);
}

fieldset {
  display: grid;
  grid-template-columns: 7fr 4fr;
  column-gap: var(--size-2);
  legend {
    grid-column: 1 / -1;
  }

  label {
    display: flex;
    gap: var(--size-3);
    align-items: center;
  }
}

form {
  /* 
    necessary because of a rendering bug caused by radix-vue's Switch that has a hiddn input with position absolute
    that causes some invisible overflow on the whole form. 
  */
  position: relative;
  overflow-y: auto;
  flex-grow: 1;
}

form > div > label,
legend {
  display: block;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-5);
}

label:not(:has(+ * + p)) + *,
p {
  display: block;
  margin-bottom: var(--size-3);
}

p {
  grid-column: 1 / -1;
}
</style>
