<script setup lang="ts">
import { type EntityId } from '@game/sdk';

const { entityId } = defineProps<{ entityId: EntityId }>();

const { assets, ui, simulationResult } = useGame();

const simulationDeathTexture = assets.getTexture('simulation-death.png');
</script>

<template>
  <container
    v-if="ui.isSimulationResultDisplayed.value && simulationResult"
    :ref="(container: any) => ui.assignLayer(container, 'ui')"
  >
    <pixi-text
      v-if="simulationResult.damageTaken[entityId]"
      :anchor="0.5"
      :y="-10"
      :scale="0.25"
      :style="{
        align: 'center',
        fill: '#ff0000',
        fontSize: 50,
        fontWeight: '900',
        strokeThickness: 6
      }"
    >
      - {{ simulationResult.damageTaken[entityId] }}
    </pixi-text>
    <pixi-text
      v-if="simulationResult.healReceived[entityId]"
      :anchor="0.5"
      :y="simulationResult.damageTaken[entityId] ? -25 : -10"
      :scale="0.25"
      :style="{
        align: 'center',
        fill: '#00FF00',
        fontSize: 50,
        fontWeight: '900',
        strokeThickness: 6
      }"
    >
      + {{ simulationResult.healReceived[entityId] }}
    </pixi-text>
    <sprite
      v-if="simulationResult.deaths.includes(entityId)"
      :texture="simulationDeathTexture"
      :anchor="0.5"
      :y="-12"
      :x="15"
    />
  </container>
</template>
