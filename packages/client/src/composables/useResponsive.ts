export const useResponsive = () => {
  const mobileBreakpoint = useCssVar('--size-lg');
  const tabletBreakpoint = useCssVar('--size-xl');
  return {
    isMobile: useMediaQuery(computed(() => `(max-width: ${mobileBreakpoint.value})`)),
    isTablet: useMediaQuery(computed(() => `(max-width: ${tabletBreakpoint.value})`))
  };
};
