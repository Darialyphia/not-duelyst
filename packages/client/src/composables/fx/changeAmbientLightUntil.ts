import type { FxCommand } from '../useFx';

export const changeAmbientLightUntil: FxCommand<'changeAmbientLightUntil'> = (
  { ui, done },
  color,
  strength
) => {
  ui.ambientLightColor.value = color;
  ui.ambientLightStrength.value = strength;
  return () => {
    ui.ambientLightColor.value = DEFAULT_AMBIENT_LIGHT_COLOR;
    ui.ambientLightStrength.value = DEFAULT_AMBIENT_LIGHT_STRENGTH;
    done();
  };
};
