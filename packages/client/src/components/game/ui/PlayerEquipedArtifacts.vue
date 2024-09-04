<script setup lang="ts">
const { playerId } = defineProps<{ playerId: string }>();
const player = useGameSelector(session => session.playerSystem.getPlayerById(playerId)!);
</script>

<template>
  <HoverCardRoot
    v-for="artifact in player.artifacts"
    :key="artifact.id"
    :open-delay="0"
    :close-delay="0"
  >
    <HoverCardTrigger as-child>
      <div class="equiped-artifact">
        <CardSprite :sprite-id="artifact.card.blueprint.spriteId" animation="default" />
        <div class="flex gap-1 justify-center">
          <div v-for="i in artifact.durability" :key="i" class="durability" />
        </div>
      </div>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent :side-offset="5" side="bottom" align="start">
        <Card
          :card="{
            blueprintId: artifact.card.id,
            name: artifact.card.name,
            description: artifact.card.description,
            kind: artifact.card.kind,
            spriteId: artifact.card.blueprint.spriteId,
            rarity: artifact.card.blueprint.rarity,
            cost: artifact.card.cost,
            faction: artifact.card.blueprint.faction,
            tags: artifact.card.blueprint.tags ?? [],
            pedestalId: artifact.card.pedestalId,
            cardbackId: artifact.card.cardBackId
          }"
        />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.equiped-artifact {
  pointer-events: auto;

  transform: scale(1.5);

  width: var(--size-6);
  margin-inline: var(--size-4);
  padding-block-start: var(--size-9);

  transition:
    scale 0.5s,
    filter 0.5s;

  @starting-style {
    scale: 1.5;
    filter: brightness(350%) contrast(200%);
  }
}

.durability {
  width: var(--size-1);
  height: var(--size-2);
  background: linear-gradient(130deg, var(--gray-0), var(--gray-4));
  outline: solid 1px hsl(0 0 0 / 0.5);
}
</style>
