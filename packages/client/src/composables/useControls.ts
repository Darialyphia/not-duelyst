import type { ControlId } from '../utils/key-bindings';

type Angle = 0 | 90 | 180 | 270;

export const useGameControls = () => {
  const { session, camera, ui, dispatch, fx } = useGame();

  const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);
  const isActive = useIsActivePlayer();
  const settings = useUserSettings();

  watchEffect(onCleanup => {
    const controls = settings.value.bindings;

    const isMatch = (e: KeyboardEvent, id: ControlId) => {
      const control = controls.find(c => c.id === id)!.control;
      if (e.code !== control.key) return false;
      const match =
        (control.modifier === null && !e.shiftKey && !e.ctrlKey && !e.altKey) ||
        (control.modifier == 'shift' && e.shiftKey) ||
        (control.modifier == 'alt' && e.altKey) ||
        (control.modifier == 'ctrl' && e.ctrlKey);

      if (match) {
        e.preventDefault();
      }
      return match;
    };

    const selectEntity = (diff: number) => {
      let selectedEntity = ui.selectedEntity.value;

      if (!selectedEntity) {
        ui.selectEntity(activePlayer.value.general.id);
        selectedEntity = activePlayer.value.general;
      } else {
        const player = selectedEntity.player;
        const entities = player.entities;
        const index = entities.findIndex(e => e.equals(selectedEntity!));
        let newIndex = index + diff;
        if (newIndex >= entities.length) {
          ui.selectEntity(player.general.id);
        } else {
          if (newIndex < 0) newIndex = entities.length - 1;
          ui.selectEntity(entities[newIndex].id);
        }
      }
      const spriteRef = fx.entityRootMap.get(selectedEntity!.id);
      if (!spriteRef) return;
      const sprite = toValue(spriteRef);
      if (!sprite) return;

      camera.viewport.value?.moveCenter(sprite.position);
    };

    const cleanup = useEventListener('keydown', e => {
      if (ui.isMenuOpened.value) return;
      if (e.repeat) return;

      if (isMatch(e, 'rotateMapLeft')) {
        camera.rotateCCW();
      }

      if (isMatch(e, 'rotateMapRight')) {
        camera.rotateCW();
      }

      if (isMatch(e, 'nextUnit')) {
        selectEntity(1);
      }
      if (isMatch(e, 'prevUnit')) {
        selectEntity(-1);
      }

      if (!activePlayer.value) return;
      if (isMatch(e, 'endTurn')) dispatch('endTurn');

      if (!ui.selectedEntity.value?.player.equals(activePlayer.value)) {
        return;
      }

      ui.selectedEntity.value.skills.forEach((skill, index) => {
        if (isMatch(e, `skill${index + 1}` as ControlId)) {
          ui.selectSkillAtIndex(index);
        }
      });

      activePlayer.value.hand.forEach((unit, index) => {
        if (isMatch(e, `summon${index + 1}` as ControlId)) {
          ui.selectCardAtIndex(index);
        }
      });
    });

    onCleanup(cleanup);
  });
};
