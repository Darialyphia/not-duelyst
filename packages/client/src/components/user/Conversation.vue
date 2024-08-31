<script setup lang="ts">
import { api, type UserDto } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

const { friend } = defineProps<{
  friend: UserDto & { friendRequestId: Id<'friendRequests'> };
}>();

const emit = defineEmits<{ close: [] }>();

const { data: messages } = useConvexAuthedPaginatedQuery(
  api.friends.conversation,
  { friendRequestId: friend.friendRequestId },
  { numItems: 30 }
);

const text = ref('');

const { mutate: sendMessage } = useConvexAuthedMutation(api.friends.sendMessage);
const { data: me } = useConvexAuthedQuery(api.users.me, {});

const chatRoot = ref<HTMLElement>();
watch(
  messages,
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

const { mutate: markAsRead } = useConvexAuthedMutation(api.friends.markAsRead);

watch(messages, newVal => {
  if (newVal) {
    markAsRead({ friendRequestId: friend.friendRequestId });
  }
});
</script>

<template>
  <div class="conversation">
    <header>
      {{ friend.fullName }}
      <UiIconButton
        name="mdi:close"
        class="ghost-button"
        aria-label="Close"
        @click="emit('close')"
      />
    </header>
    <TransitionGroup ref="chatRoot" tag="ul" class="fancy-scrollbar">
      <li
        v-for="message in messages"
        :key="message._id"
        :class="message.userId === me._id && 'my-message'"
      >
        {{ message.text }}
      </li>
    </TransitionGroup>

    <form
      @submit.prevent="
        () => {
          sendMessage({ friendRequestId: friend.friendRequestId, text });
          text = '';
        }
      "
    >
      <UiTextInput
        id="new-message"
        v-model="text"
        placeholder="Type here..."
        class="message-input"
      />
    </form>
  </div>
</template>

<style scoped lang="postcss">
.conversation {
  width: var(--size-14);
  height: 100%;
  border-left: solid var(--border-size-1) var(--border-dimmed);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

ul {
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  padding: var(--size-4) var(--size-6);
  margin-bottom: var(--size-4);
  gap: var(--size-3);
  align-self: start;
  max-height: 100%;
  li {
    padding: var(--size-2);
    width: 80%;
    align-self: flex-start;
    border-radius: var(--radius-2);
    background-color: var(--gray-9);
    position: relative;

    &.v-enter-active {
      transition: all 0.3s;
    }

    &.v-enter-from {
      opacity: 0;
      scale: 0;
    }
    &::after {
      content: '';
      position: absolute;
      width: var(--size-3);
      aspect-ratio: 1;
      top: 0;
      z-index: 1;
    }

    &:not(.my-message) {
      border-top-left-radius: 0;
      &::after {
        right: 100%;
        background-color: var(--gray-9);
        clip-path: polygon(0% 0%, 100% 0, 100% 100%);
      }
    }

    &.my-message {
      background-color: var(--primary-darker);
      align-self: flex-end;
      border-top-right-radius: 0;
      &::after {
        left: 100%;
        background-color: var(--primary-darker);
        clip-path: polygon(0% 0%, 100% 0, 0% 100%);
      }
    }
  }
}

header {
  --ui-button-color: currentColor;

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--size-1) var(--size-2);

  font-weight: var(--font-weight-5);
  border-bottom: solid var(--border-size-1) var(--border-dimmed);
}

.message-input {
  border-bottom-width: 0;
  border-right-width: 0;
}

form {
  background-color: var(--fancy-bg);
  padding-top: var(--size-2);
}
</style>
