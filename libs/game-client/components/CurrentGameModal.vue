<script setup lang="ts">
import { api } from '@hc/api';

const route = useRoute();
const router = useRouter();
const sessionId = useSessionId();
const { data: currentGame } = useConvexQuery(
  api.games.getCurrent,
  computed(() => ({ sessionId: sessionId.value })),
  { ssr: false, enabled: computed(() => !!sessionId.value) }
);

const hasCurrentOngoingGame = computed(
  () =>
    route.name !== 'Game' &&
    !!currentGame.value &&
    currentGame.value.status !== 'FINISHED'
);

watchEffect(() => {
  if (hasCurrentOngoingGame.value) {
    router.replace({ name: 'Game', query: { roomId: currentGame.value?.roomId } });
  }
});
</script>

<template>
  <DialogRoot :open="hasCurrentOngoingGame" modal>
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content">
        <div class="fancy-surface">
          <DialogTitle>Connecting to your game...</DialogTitle>
        </div>
        <DialogClose />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 1;
  inset: 0;
  background-color: hsl(var(--gray-12-hsl) / 0.5);
}

.modal-content {
  position: fixed;
  z-index: 2;
  inset: 0;

  display: grid;
  place-content: center;
}
</style>
