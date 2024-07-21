<script setup lang="ts">
import { type GameSessionConfig, type GenericSerializedBlueprint } from '@game/sdk';

const emit = defineEmits<{ submit: [typeof form] }>();
const { initialValues } = defineProps<{
  initialValues: {
    name: string;
    description: string;
    config: GameSessionConfig;
    cards: Record<string, GenericSerializedBlueprint>;
  };
}>();

const form = reactive(initialValues);
const tab = useRouteQuery('tab', 'config');
</script>

<template>
  <TabsRoot
    v-model="tab"
    class="fancy-surface fancy-scrollbar container form"
    style="--container-size: var(--size-xl)"
  >
    <TabsList aria-label="Create your format" class="fancy-surface tab-list">
      <TabsIndicator class="tab-indicator">
        <div class="bg-primary w-full h-full" />
      </TabsIndicator>

      <TabsTrigger value="config">Settings</TabsTrigger>
      <TabsTrigger value="cards">Cards</TabsTrigger>
    </TabsList>

    <TabsContent value="config" class="tab config-tab fancy-scrollbar">
      <div>
        <RulesEditor :config="form" />
      </div>
    </TabsContent>

    <TabsContent value="cards" class="tab overflow-hidden">
      <FormatCards :format="form" />
    </TabsContent>
    <footer>
      <UiFancyButton
        v-model="form.description"
        type="button"
        :style="{ '--hue': '10DEG', '--hue2': '20DEG' }"
      >
        Reset
      </UiFancyButton>
      <UiFancyButton v-model="form.description" @click="emit('submit', form)">
        Save
      </UiFancyButton>
    </footer>
  </TabsRoot>
</template>

<style scoped lang="postcss">
textarea {
  resize: none;

  width: 100%;

  background-color: var(--surface-1);
  border: solid 1px var(--border-dimmed);
  border-radius: var(--radius-1);
}

fieldset {
  position: relative;

  display: grid;
  grid-template-columns: 7fr 4fr;
  column-gap: var(--size-2);

  margin-top: var(--size-5);
  &::after {
    content: '';

    position: absolute;
    top: calc(-1 * var(--size-8));
    left: 50%;
    transform: translateX(-50%);

    width: var(--size-12);
    height: 3px;

    background: linear-gradient(to right, var(--border), var(--primary), var(--border));
  }

  legend {
    grid-column: 1 / -1;
  }

  label {
    display: flex;
    gap: var(--size-3);
    align-items: center;
    & + *:not(p) {
      margin-bottom: var(--size-3);
    }
  }

  p {
    margin-top: calc(-1 * var(--size-2));
    font-size: var(--font-size-0);
    color: var(--orange-5);
  }
}

.form {
  /*
    necessary because of a rendering bug caused by radix-vue's Switch that has a hiddn input with position absolute
    that causes some invisible overflow on the whole form.
  */
  position: relative;

  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: var(--size-4);

  padding: 0;
}

footer {
  display: flex;
  gap: var(--size-4);
  justify-content: flex-end;

  margin-top: auto;
  padding: var(--size-4);

  border-top: solid var(--border-size-1) var(--border);
}
.form > footer button {
  min-width: 15ch;
}
.form > div > label,
legend {
  display: block;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-5);
}

p {
  grid-column: 1 / -1;
}

.tab-list {
  position: sticky;
  position: relative;
  z-index: 1;
  top: 0;

  display: flex;
  gap: var(--size-4);

  border-color: transparent;
  border-bottom-color: var(--border-dimmed);
}

.tab-indicator {
  position: absolute;
  bottom: var(--size-2);
  left: 0;
  transform: translateX(var(--radix-tabs-indicator-position));

  width: var(--radix-tabs-indicator-size);
  height: 2px;

  border-radius: var(--radius-pill);

  transition-duration: 300ms;
  transition-property: width, transform;
}

.tab {
  height: 100%;
  padding: var(--size-4);
  padding-bottom: 0;
}

.config-tab {
  overflow: auto;
  height: 100%;

  > div {
    width: var(--size-md);
  }
}
</style>
