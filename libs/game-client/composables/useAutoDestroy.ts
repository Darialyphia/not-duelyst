export const useAutoDestroy = () => {
  const elementsToDestroy = ref<{ destroy: () => void; destroyed: boolean }[]>([]);

  onBeforeUnmount(() => {
    // handles a vue3-pixi bug where the animated-sprite doesn't destroy itself on unmount
    elementsToDestroy.value?.forEach(element => {
      if (!element?.destroyed) {
        element?.destroy();
      }
    });
  });

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoDestroyRef: (el: any) => {
      if (!elementsToDestroy.value.includes(el)) {
        elementsToDestroy.value?.push(el);
      }
    }
  };
};
