import type { GameSessionConfig, GenericSerializedBlueprint } from '@game/sdk';
import type { InjectionKey } from 'vue';

type FormatContext = Ref<{
  cards: Record<string, GenericSerializedBlueprint>;
  config: GameSessionConfig;
}>;

export const FORMAT_INJECTION_KEY = Symbol('format') as InjectionKey<FormatContext>;

export const useFormatProvider = (format: FormatContext) => {
  provide(FORMAT_INJECTION_KEY, format);
};

export const useFormat = () => useSafeInject(FORMAT_INJECTION_KEY);
