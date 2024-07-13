import type { KeyBinding } from '~/components/ui/UiKeyInput.vue';

export const defaultBindings: { id: string; label: string; control: KeyBinding }[] = [
  {
    id: 'rotateMapLeft',
    label: 'Rotate map Left',
    control: { key: 'KeyQ', modifier: null }
  },
  {
    id: 'rotateMapRight',
    label: 'Rotate map Right',
    control: { key: 'KeyE', modifier: null }
  },
  {
    id: 'summon1',
    label: 'Play card 1',
    control: { key: 'Digit1', modifier: null }
  },
  {
    id: 'summon2',
    label: 'Play card 2',
    control: { key: 'Digit2', modifier: null }
  },
  {
    id: 'summon3',
    label: 'Play card 3',
    control: { key: 'Digit3', modifier: null }
  },
  {
    id: 'summon4',
    label: 'Play card 4',
    control: { key: 'Digit4', modifier: null }
  },
  {
    id: 'summon5',
    label: 'Play card 5',
    control: { key: 'Digit5', modifier: null }
  },
  {
    id: 'summon6',
    label: 'Play card 6',
    control: { key: 'Digit6', modifier: null }
  },
  {
    id: 'endTurn',
    label: 'End turn',
    control: { key: 'KeyT', modifier: null }
  },
  {
    id: 'nextUnit',
    label: 'Next unit',
    control: { key: 'Tab', modifier: null }
  },
  {
    id: 'prevUnit',
    label: 'Previous unit',
    control: { key: 'Tab', modifier: 'shift' }
  }
];

export type ControlId = (typeof defaultBindings)[number]['id'];
