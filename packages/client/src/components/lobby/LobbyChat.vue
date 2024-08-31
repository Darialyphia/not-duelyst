<script setup lang="ts">
import { api } from '@game/api';
import type { LobbyDetailsDto } from '@game/api/src/convex/lobby/lobby.mapper';

const { lobby } = defineProps<{ lobby: LobbyDetailsDto }>();

const chatMessage = ref('');
const { mutate: sendMessage } = useConvexAuthedMutation(api.lobbies.sendMessage, {
  onSuccess() {
    chatMessage.value = '';
  }
});
const chatRoot = ref<HTMLElement>();
const messageCount = computed(() => lobby.messages.length);

watch(
  messageCount,
  () => {
    nextTick(() => {
      const el = unrefElement(chatRoot);
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    });
  },
  { immediate: true }
);
</script>

<template>
  <TransitionGroup ref="chatRoot" tag="ul" class="chat fancy-scrollbar">
    <li v-for="(message, index) in lobby.messages" :key="index">
      <span>{{ message.author }}</span>
      : {{ message.text }}
    </li>
  </TransitionGroup>

  <form
    class="flex gap-3"
    @submit.prevent="sendMessage({ lobbyId: lobby._id, text: chatMessage })"
  >
    <UiTextInput
      id="message"
      v-model="chatMessage"
      class="flex-1"
      aria-label="Send a message"
      placeholder="Type your message here..."
    />
    <InteractableSounds>
      <UiButton class="primary-button">Send</UiButton>
    </InteractableSounds>
  </form>
</template>

<style scoped lang="postcss">
.chat {
  overflow-y: auto;
  flex-grow: 1;

  padding: var(--size-3);

  background-color: oklch(from var(--surface-2) l c h / 30%);
  border: solid 1px var(--border-dimmed);
  li {
    line-height: 2;

    &.v-enter-active {
      transition: all 0.3s;
    }

    &.v-enter-from {
      transform: translateX(var(--size-8));
      opacity: 0;
    }

    > span {
      font-weight: var(--font-weight-5);
      color: var(--primary);
    }
  }
}
</style>
