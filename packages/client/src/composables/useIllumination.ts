import { DisplayObject, Filter } from 'pixi.js';
import { diffuseGroup, normalGroup } from '@pixi/lights';

const fragShader = /*glsl*/ `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
  vec4 original = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(mix(original.r, 1.0 - original.r, original.a), original.gba);
}
`;

const flipFilter = new Filter(undefined, fragShader);

export const useIllumination = <T extends DisplayObject>(
  diffuseCallback?: (el: T) => void,
  normalCallback?: (el: T) => void
) => {
  const { settings } = useUserSettings();

  return {
    normalFilter: flipFilter,
    diffuseRef: (el?: T) => {
      if (!el) return;
      diffuseCallback?.(el);
      if (settings.value.fx.dynamicLighting) {
        el.parentGroup = diffuseGroup;
      }
    },
    normalRef: (el?: T) => {
      if (!el) return;
      normalCallback?.(el);
      if (settings.value.fx.dynamicLighting) {
        el.parentGroup = normalGroup;
      }
    },
    isEnabled: computed(() => settings.value.fx.dynamicLighting)
  };
};
