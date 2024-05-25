<script setup lang="ts">
import { CARDS } from '@game/sdk';

const { blueprintId } = defineProps<{ blueprintId: string }>();

const card = CARDS[blueprintId];
</script>

<template>
  <div class="my-6 grid grid-cols-2">
    <Card
      :has-modal="false"
      with-skills
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
        cooldown: card.cooldown,
        skills: card.skills,
        factions: card.factions,
        tribes: card.tribes ?? []
      }"
    />
    <div>
      <slot />
    </div>
  </div>
</template>
