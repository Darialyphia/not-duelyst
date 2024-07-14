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
    id: 'replace1',
    label: 'Replace card 1',
    control: { key: 'Digit1', modifier: 'shift' }
  },
  {
    id: 'replace2',
    label: 'Replace card 2',
    control: { key: 'Digit2', modifier: 'shift' }
  },
  {
    id: 'replace3',
    label: 'Replace card 3',
    control: { key: 'Digit3', modifier: 'shift' }
  },
  {
    id: 'replace4',
    label: 'Replace card 4',
    control: { key: 'Digit4', modifier: 'shift' }
  },
  {
    id: 'replace5',
    label: 'Replace card 5',
    control: { key: 'Digit5', modifier: 'shift' }
  },
  {
    id: 'replace6',
    label: 'Replace card 6',
    control: { key: 'Digit6', modifier: 'shift' }
  },
  {
    id: 'endTurn',
    label: 'End turn',
    control: { key: 'KeyT', modifier: null }
  },
  { id: 'skipTargets', label: 'Skip targets', control: { key: 'KeyS', modifier: null } },
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
