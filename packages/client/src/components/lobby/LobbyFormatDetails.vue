<script setup lang="ts">
import { api } from '@game/api';
import type { LobbyDetailsDto } from '@game/api/src/convex/lobby/lobby.mapper';
import { CARDS } from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';

const { lobby } = defineProps<{ lobby: LobbyDetailsDto }>();

const isOpened = ref(false);

const { data: format } = useConvexAuthedQuery(
  api.formats.byId,
  computed(() => ({ id: lobby.format._id! })),
  { enabled: computed(() => !!lobby.format._id) }
);

const changedCards = computed(() => {
  if (!format.value) return [];

  return Object.values(format.value.cards)
    .filter(card => !!CARDS[card.id])
    .map(c => parseSerializeBlueprint(c));
});
const customCards = computed(() => {
  if (!format.value) return [];

  return Object.values(format.value.cards)
    .filter(card => !CARDS[card.id])
    .map(c => parseSerializeBlueprint(c));
});
</script>

<template>
  <UiButton v-if="format" class="ghost-button" is-inline @click="isOpened = true">
    See details
  </UiButton>

  <UiDrawer v-model:is-opened="isOpened" direction="left" size="sm">
    <p class="description">{{ format.description }}</p>
    <FormatRules v-if="format" :format="format" />

    <h4 class="mt-4">Changed cards</h4>
    <p v-if="!changedCards.length">This format doesnt havany changed cards</p>
    <ul>
      <li v-for="card in changedCards" :key="card.id">
        <HoverCardRoot :open-delay="0" :close-delay="0">
          <HoverCardTrigger class="py-2 block">
            {{ card.name }}
          </HoverCardTrigger>

          <HoverCardPortal disabled>
            <HoverCardContent :side-offset="5" side="left" align="start">
              <Card
                :card="{
                  blueprintId: card.id,
                  name: card.name,
                  description: card.description,
                  kind: card.kind,
                  spriteId: card.spriteId,
                  rarity: card.rarity,
                  cost: card.cost,
                  attack: card.attack,
                  hp: card.maxHp,
                  faction: card.faction,
                  tags: card.tags ?? []
                }"
              />
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCardRoot>
      </li>
    </ul>

    <h4 class="mt-4">Custom cards</h4>
    <p v-if="!customCards.length">This format doesnt have any custom cards</p>
    <ul>
      <li v-for="card in customCards" :key="card.id">{{ card.name }}</li>
    </ul>
  </UiDrawer>
</template>

<style scoped lang="postcss">
.description {
  padding: var(--size-3);
  border: solid var(--border-size-1) var(--border-dimmed);
  margin-bottom: var(--size-3);
}
</style>
