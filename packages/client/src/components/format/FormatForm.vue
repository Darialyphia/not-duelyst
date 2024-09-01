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
  <TabsRoot v-model="tab" class="fancy-surface fancy-scrollbar form">
    <TabsList aria-label="Create your format" class="fancy-surface tab-list">
      <BackButton :to="{ name: 'FormatList' }" />
      <div class="text-4 font-600">
        {{ initialValues.name }}
      </div>
      <TabsIndicator class="tab-indicator">
        <div class="bg-primary w-full h-full" />
      </TabsIndicator>

      <TabsTrigger value="config">Settings</TabsTrigger>
      <TabsTrigger value="cards">Cards</TabsTrigger>
      <TabsTrigger value="map">Map</TabsTrigger>

      <UiButton v-model="form.description" class="error-button ml-auto" type="button">
        Reset
      </UiButton>
      <UiButton
        v-model="form.description"
        class="primary-button"
        @click="emit('submit', form)"
      >
        Save
      </UiButton>
    </TabsList>

    <TabsContent value="config" class="tab config-tab fancy-scrollbar">
      <div class="mx-auto">
        <RulesEditor :config="form" />
      </div>
    </TabsContent>

    <TabsContent value="cards" class="tab overflow-hidden">
      <FormatCards :format="form" />
    </TabsContent>

    <TabsContent value="map" class="tab overflow-hidden">
      <MapEditorRoot />
    </TabsContent>
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

  display: grid;
  grid-template-rows: auto 1fr;
  gap: var(--size-4);

  height: 100dvh;
  padding: 0;

  border: none;
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
  align-items: center;

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
  padding: var(--size-4);
  padding-bottom: 0;
}

.config-tab {
  overflow: auto;

  > div {
    width: var(--size-md);
  }
}
</style>
