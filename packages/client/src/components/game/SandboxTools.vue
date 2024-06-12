<script setup lang="ts">
import { ClientSession, config, type GameSession, type ServerSession } from '@game/sdk';

const { clientSession, serverSession } = defineProps<{
  serverSession: ServerSession;
  clientSession: ClientSession;
}>();

const performAction = (cb: (session: GameSession) => void) => {
  cb(serverSession);
  // eslint-disable-next-line vue/no-mutating-props
  clientSession.rngSystem.values = serverSession.rngSystem.serialize().values;
  cb(clientSession);
};
</script>

<template>
  <div class="sandbox-tools">
    <PopoverRoot>
      <PopoverTrigger>Sandbox Tools</PopoverTrigger>
      <PopoverAnchor />
      <PopoverPortal>
        <PopoverContent class="fancy-surface p-2">
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                session.playerSystem.activePlayer.draw(1);
              })
            "
          >
            Draw card
          </UiButton>
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                session.playerSystem.activePlayer.draw(config.MAX_HAND_SIZE);
              })
            "
          >
            Fill hand
          </UiButton>
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                const player = session.playerSystem.activePlayer;
                player.hand.forEach(card => {
                  player.deck.addToBottom(card);
                });
                player.hand = [];
                player.deck.shuffle();
                player.draw(config.MAX_HAND_SIZE);
              })
            "
          >
            Replace hand
          </UiButton>
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                session.playerSystem.activePlayer.giveGold(config.MAX_GOLD);
              })
            "
          >
            Max out gold
          </UiButton>
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                session.playerSystem.activePlayer.addRune('f1');
              })
            "
          >
            Give Faction 1 rune
          </UiButton>
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                session.playerSystem.activePlayer.addRune('f2');
              })
            "
          >
            Give Faction 2 rune
          </UiButton>
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                session.playerSystem.activePlayer.addRune('f3');
              })
            "
          >
            Give Faction 3 rune
          </UiButton>
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                session.playerSystem.activePlayer.addRune('f4');
              })
            "
          >
            Give Faction 4 rune
          </UiButton>
          <UiButton
            class="ghost-button"
            @click="
              performAction(session => {
                session.playerSystem.activePlayer.addRune('f5');
              })
            "
          >
            Give Faction 5 rune
          </UiButton>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </div>
</template>

<style scoped lang="postcss">
.sandbox-tools {
  position: absolute;
  top: var(--size-5);
  left: var(--size-15);

  font-family: monospace;
  color: white;
}
</style>
