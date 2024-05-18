<script setup lang="ts">
export type ModalStyleVariables = '--ui-modal-size';

const isOpened = defineModel<boolean>('isOpened', { required: true });
const {
  title,
  description,
  style = {},
  closable = true
} = defineProps<{
  title: string;
  description?: string;
  closable?: boolean;
  style?: StyleProp<ModalStyleVariables>;
}>();
</script>

<template>
  <DialogRoot v-model:open="isOpened" modal>
    <DialogPortal>
      <Transition appear>
        <DialogOverlay class="modal-overlay" />
      </Transition>

      <Transition appear>
        <DialogContent
          class="modal-content"
          :style="style"
          @escape-key-down="
            e => {
              if (!closable) e.preventDefault();
            }
          "
          @focus-outside="
            e => {
              if (!closable) e.preventDefault();
            }
          "
          @interact-outside="
            e => {
              if (!closable) e.preventDefault();
            }
          "
        >
          <div class="fancy-surface">
            <DialogTitle class="pb-5">
              <slot name="title" :title="title">{{ title }}</slot>
            </DialogTitle>

            <DialogDescription v-if="description">
              {{ description }}
            </DialogDescription>

            <slot />
          </div>
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

  &:focus {
    outline: none;
  }
  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}

.modal-content {
  --_ui-modal-size: var(--ui-modal-size, var(--size-md));

  position: fixed;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  container-type: inline-size;
  display: grid;
  place-content: center;

  width: var(--_ui-modal-size);
  max-width: calc(100% - 2 * var(--size-3));

  > div {
    pointer-events: all;
  }

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.3s,
      opacity 0.2s 0.1s;
  }

  &.v-enter-from {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }

  &.v-leave-to {
    transform: translate(-50%, calc(-50% - 3rem));
    opacity: 0;
  }
}
</style>
