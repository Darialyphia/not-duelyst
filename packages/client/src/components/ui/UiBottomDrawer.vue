<script setup lang="ts">
import { DialogPortal } from 'radix-vue';

export type ModalStyleVariables = '--ui-modal-size';

const isOpened = defineModel<boolean>('isOpened', { required: true });
const {
  title,
  style = {},
  closable = true,
  usePortal = true
} = defineProps<{
  title?: string;
  closable?: boolean;
  style?: StyleProp<ModalStyleVariables>;
  usePortal?: boolean;
}>();

const Content = createReusableTemplate();
</script>

<template>
  <DialogRoot v-model:open="isOpened" modal>
    <Content.define>
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
            <DialogTitle v-if="title">
              <slot name="title" :title="title">{{ title }}</slot>
            </DialogTitle>

            <div class="fancy-scrollbar">
              <slot />
            </div>
          </div>
        </DialogContent>
      </Transition>
    </Content.define>

    <DialogPortal v-if="usePortal">
      <Content.reuse />
    </DialogPortal>
    <Content.reuse v-else />
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
  position: fixed;
  z-index: 2;
  bottom: 0%;
  left: 0;

  container-type: inline-size;
  overflow-y: hidden;

  width: 100%;

  &:focus,
  &:focus-visible {
    outline: none;
  }
  > div {
    pointer-events: all;

    overflow-y: hidden;
    display: grid;
    grid-template-rows: auto 1fr;

    height: 60dvh;
    padding-inline: 0;

    > * {
      padding-inline: var(--size-4);
    }

    > div {
      overflow-y: auto;
    }
  }

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.3s,
      opacity 0.2s 0.1s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(100%);
    opacity: 0;
  }
}
</style>
