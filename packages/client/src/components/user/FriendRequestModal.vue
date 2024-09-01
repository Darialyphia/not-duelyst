<script setup lang="ts">
import { api } from '@game/api';

const isOpened = defineModel<boolean>('isOpened', { required: true });

const name = ref('');
const isNameCorrect = computed(() => /^.+#[0-9]{4}$/.test(name.value));
const { mutate: sendFriendRequest } = useConvexAuthedMutation(
  api.friends.sendFriendRequest,
  {
    onSuccess() {
      name.value = '';
      isOpened.value = false;
    }
  }
);
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Add Friend"
    :use-portal="false"
    :style="{ '--ui-modal-size': 'var(--size-xs)' }"
  >
    <form
      class="friend-request-modal"
      @submit.prevent="
        () => {
          const [username, discriminator] = name.split('#');
          sendFriendRequest({
            name: username,
            discriminator
          });
        }
      "
    >
      <label for="friend-request-name" class="block mb-3">
        Enter your friend's username
      </label>
      <input id="friend-request-name" v-model="name" class="w-full" />
      <p>
        <Icon name="ph:warning-circle" />
        format: username#1234
      </p>

      <footer>
        <UiButton class="ghost-button" type="button" @click="isOpened = false">
          Cancel
        </UiButton>
        <UiButton class="primary-button" :disabled="!isNameCorrect">Send</UiButton>
      </footer>
    </form>
  </UiModal>
</template>

<style scoped lang="postcss">
.friend-request-modal {
  > input {
    border: var(--fancy-border);
  }

  > p {
    margin-top: var(--size-2);
    font-size: var(--font-size-00);
    color: var(--gray-5-hsl);
  }

  > footer {
    display: flex;
    gap: var(--size-6);
    justify-content: space-around;
    margin-top: var(--size-5);
  }
}
</style>
