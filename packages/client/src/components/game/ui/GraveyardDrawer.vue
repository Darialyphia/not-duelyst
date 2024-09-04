<script setup lang="ts">
const { playerId } = defineProps<{ playerId: string }>();
const player = useGameSelector(session => session.playerSystem.getPlayerById(playerId)!);
const isOpened = defineModel<boolean>('isOpened', { required: true });
</script>

<template>
  <UiDrawer v-model:is-opened="isOpened" direction="right">
    <h3>{{ player.name }}'s graveyard</h3>
    <ul class="graveyard-list">
      <HoverCardRoot
        v-for="{ card } in player.graveyard"
        :key="card.id"
        :open-delay="0"
        :close-delay="0"
      >
        <HoverCardTrigger as-child>
          <li class="fancy-surface">
            {{ card.blueprint.name }}
            <CardSprite
              :sprite-id="card.blueprint.spriteId"
              class="card-sprite"
              :class="card.blueprint.kind.toLowerCase()"
            />
          </li>
        </HoverCardTrigger>

        <HoverCardPortal disabled>
          <HoverCardContent :side-offset="5" side="left" align="start">
            <Card
              :card="{
                blueprintId: card.blueprint.id,
                name: card.name,
                description: card.description,
                kind: card.kind,
                spriteId: card.blueprint.spriteId,
                rarity: card.blueprint.rarity,
                cost: card.cost,
                attack: card.blueprint.attack,
                hp: card.blueprint.maxHp,
                faction: card.blueprint.faction,
                tags: card.blueprint.tags ?? [],
                pedestalId: card.pedestalId,
                cardbackId: card.cardBackId
              }"
            />
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </ul>
  </UiDrawer>
</template>

<style scoped lang="postcss">
.graveyard-list {
  display: grid;
  margin-top: var(--size-6);
  li {
    border-radius: var(--radius-1);
    font-weight: var(--font-weight-5);
    padding: var(--size-2) var(--size-5);
    height: 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .card-sprite {
      height: 100%;
      aspect-ratio: 1;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;

      &:is(.general, .minion):deep(> div) {
        bottom: 50%;
        transform: translateX(-50%) translateY(40%);
      }
    }
  }
}
</style>
