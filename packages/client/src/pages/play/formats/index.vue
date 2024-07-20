<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'FormatList',
  pageTransition: {
    name: 'formats-page',
    mode: 'out-in',
    appear: true
  }
});

const { data: formats } = useConvexAuthedQuery(api.formats.getMyFormats, {});
</script>

<template>
  <div class="page container pt-8 px-5" style="--container-size: var(--size-md)">
    <header>
      <BackButton />
      <h1>Formats</h1>
    </header>

    <section v-if="formats" class="fancy-surface py-8 mt-6">
      <div v-if="!formats.length" class="text-center">
        <p class="text-3">You haven't created any format yet.</p>

        <NuxtLink v-slot="{ href, navigate }" custom :to="{ name: 'CreateFormat' }">
          <UiButton
            :href
            class="ghost-button create-button"
            :style="{ '--ui-button-hover-bg': 'transparent' }"
            @click="navigate"
          >
            Create you first format
          </UiButton>
        </NuxtLink>
      </div>

      <AccordionRoot v-else type="single" collapsible :default-value="formats[0]._id">
        <AccordionItem v-for="format in formats" :key="format._id" :value="format._id">
          <AccordionHeader as="h2" class="flex justify-between">
            <AccordionTrigger>
              {{ format.name }}
              <Icon name="mdi:chevron-down" class="chevron" />
            </AccordionTrigger>

            <NuxtLink
              v-slot="{ href, navigate }"
              custom
              :to="{ name: 'EditFormat', params: { id: format._id } }"
            >
              <UiButton
                left-icon="material-symbols:edit"
                class="primary-button"
                :href
                @click="navigate"
              >
                Edit
              </UiButton>
            </NuxtLink>
          </AccordionHeader>

          <AccordionContent class="accordion-content">
            <p>{{ format.description }}</p>
            <h3>Rules :</h3>
            <ul>
              <li>
                Deck size is
                <span class="param">{{ format.config.MAX_DECK_SIZE }}</span>
              </li>
              <li>
                Max copies per card is
                <span class="param">{{ format.config.MAX_COPIES_PER_CARD }}</span>
              </li>
              <li>
                Max hand size is
                <span class="param">{{ format.config.MAX_HAND_SIZE }}</span>
              </li>
              <li>
                Players draw
                <span class="param">{{ format.config.CARD_DRAW_PER_TURN }}</span>
                cards per turn
              </li>
              <li>
                Players can replace
                <span class="param">
                  {{ format.config.MAX_REPLACES_PER_TURN }} times per turn.
                </span>
              </li>
              <li>
                Starting hand size is
                <span class="param">{{ format.config.STARTING_HAND_SIZE }}</span>
              </li>
              <li>
                Max gold is
                <span class="param">{{ format.config.MAX_GOLD }}</span>
              </li>
              <li>
                Players
                <span class="param">
                  {{ format.config.REFILL_GOLD_EVERY_TURN ? 'DO' : "DON'T" }}
                </span>
                refill their gold at the start of their turn
              </li>
              <li v-if="!format.config.REFILL_GOLD_EVERY_TURN">
                Players instead refill
                <span class="param">
                  {{ format.config.GOLD_PER_TURN }} gold per turn.
                </span>
              </li>
              <li>
                Players increase their max mana by
                <span class="param">{{ format.config.MAX_GOLD_INCREASE_PER_TURN }}</span>
              </li>
              <li>
                Player 1 starts with
                <span class="param">{{ format.config.PLAYER_1_STARTING_GOLD }}</span>
                gold
              </li>
              <li>
                Player 2 starts with
                <span class="param">{{ format.config.PLAYER_2_STARTING_GOLD }}</span>
                gold
              </li>
              <li>
                Units
                <span class="param">
                  {{ format.config.CAN_MOVE_AFTER_ATTACK ? 'CAN' : 'CANNOT' }}
                </span>
                move after attacking
              </li>
              <li>
                Units
                <span class="param">
                  {{ format.config.CAN_WALK_THROUGH_ALLIES ? 'CAN' : 'CANNOT' }}
                </span>
                move through allies
              </li>
              <li>
                Units
                <span class="param">
                  {{ format.config.CAN_WALK_THROUGH_ALLIES ? 'HAVE' : "DON'T HAVE" }}
                </span>
                unlimited counterattacks.
              </li>
              <li>
                Units can move
                <span class="param">
                  {{ format.config.UNIT_DEFAULT_SPEED }}
                  spaces.
                </span>
              </li>
              <li>
                Artifacts have
                <span class="param">
                  {{ format.config.ARTIFACT_DURABILITY }} durability
                </span>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <UiButton
          class="primary-button mt-6"
          left-icon="material-symbols:add"
          :to="{ name: 'CreateFormat' }"
        >
          New Format
        </UiButton>
      </AccordionRoot>
    </section>
  </div>
</template>

<style lang="postcss">
.formats-page-enter-active,
.formats-page-leave-active {
  transition: all 0.3s;
}
.formats-page-enter-from,
.formats-page-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>
<style scoped lang="postcss">
@keyframes format-list-slide-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes format-list-slide-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}

.page {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  > header {
    text-shadow: black 0px 4px 1px;
  }
}

.create-button {
  margin-top: var(--size-5);
  margin-inline: auto;

  font-size: var(--font-size-3);
  line-height: 1;
  color: var(--primary);

  &:hover {
    text-decoration: underline;
  }
}

.chevron {
  color: var(--grass-10);
  transition: transform 0.3s ease-out;
}
[data-state='open'] > .chevron {
  transform: rotate(180deg);
}

.accordion-content {
  overflow: hidden;
  padding-block: var(--size-4);
  &[data-state='open'] {
    animation: format-list-slide-down 0.2s ease-out;
  }
  &[data-state='closed'] {
    animation: format-list-slide-up 0.2s ease-out;
  }

  > p {
    padding: var(--size-3);
    border: solid var(--border-size-1) var(--border-dimmed);
  }

  > h3 {
    margin-block: var(--size-4) var(--size-2);
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-5);
  }

  li {
    line-height: 1.6;
  }
}

.param {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-5);
  color: var(--primary);
}
</style>
