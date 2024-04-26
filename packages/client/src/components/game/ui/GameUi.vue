<script setup lang="ts">
const { ui, session } = useGame();

const entity = computed(() => ui.hoveredEntity.value);
// const entity = computed(() => session.playerSystem.getList()[0].general);
</script>

<template>
  <TeamInfos />
  <ActionBar />
  <TargetingUi />
  <CombatLog />

  <div
    v-if="entity"
    class="absolute top-13"
    :class="entity.player.isPlayer1 ? 'left-10' : 'right-10'"
  >
    <Card
      :card="{
        name: entity.card.blueprint.name,
        description: entity.card.blueprint.description,
        kind: entity.card.kind,
        spriteId: entity.card.blueprint.spriteId,
        rarity: entity.card.blueprint.rarity,
        attack: entity.attack,
        hp: entity.hp,
        speed: entity.speed,
        cost: entity.card.cost,
        cooldown: entity.card.cooldown,
        skills: entity.card.blueprint.skills
      }"
    />
  </div>
</template>
