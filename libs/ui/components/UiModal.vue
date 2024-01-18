<script setup lang="ts">
const isOpened = defineModel<boolean>('isOpened', { required: true });
const { title, description } = defineProps<{ title: string; description?: string }>();
</script>

<template>
  <DialogRoot :open="isOpened" modal>
    <DialogPortal>
      <Transition appear>
        <DialogOverlay class="modal-overlay" />
      </Transition>

      <Transition appear>
        <DialogContent class="modal-content">
          <div class="fancy-surface">
            <DialogTitle class="pb-5">{{ title }}</DialogTitle>
            <DialogDescription v-if="description">
              {{ description }}
            </DialogDescription>
            <slot />
          </div>
          <DialogClose />
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 1;
  inset: 0;

  background-color: hsl(var(--gray-12-hsl) / 0.5);
  backdrop-filter: blur(5px);
  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}

.modal-content {
  position: fixed;
  z-index: 2;
  inset: 0;

  display: grid;
  place-content: center;
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.2s;
  }
  &.v-enter-active {
    transition-delay: 0.2s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(calc(-1 * var(--size-5)));
    opacity: 0;
  }
}
</style>
