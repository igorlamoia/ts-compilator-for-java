import { useEffect, useState } from "react";

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  "3xl": 1920,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;
type BreakpointFlags = {
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  is3xl: boolean;
};

const DEFAULT_FLAGS: BreakpointFlags = {
  isXs: false,
  isSm: false,
  isMd: false,
  isLg: false,
  isXl: false,
  is2xl: false,
  is3xl: false,
};

const FLAGS_BY_KEY: Record<Breakpoint, keyof BreakpointFlags> = {
  xs: "isXs",
  sm: "isSm",
  md: "isMd",
  lg: "isLg",
  xl: "isXl",
  "2xl": "is2xl",
  "3xl": "is3xl",
};

const BREAKPOINT_ENTRIES = Object.entries(BREAKPOINTS) as [
  Breakpoint,
  number,
][];

export function useBreakpoint(breakpoint: Breakpoint) {
  const [state, setState] = useState<{
    matches: boolean;
    current: BreakpointFlags;
  }>({
    matches: false,
    current: DEFAULT_FLAGS,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getCurrentBreakpoint = (): Breakpoint => {
      const width = window.innerWidth;
      let current: Breakpoint = "xs";

      for (const [key, value] of BREAKPOINT_ENTRIES) {
        if (width >= value) {
          current = key;
        }
      }

      return current;
    };

    const getCurrentFlags = (): BreakpointFlags => {
      const currentKey = getCurrentBreakpoint();
      return {
        ...DEFAULT_FLAGS,
        [FLAGS_BY_KEY[currentKey]]: true,
      };
    };

    const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
    const media = window.matchMedia(query);

    const handleChange = () => {
      setState({
        matches: media.matches,
        current: getCurrentFlags(),
      });
    };

    handleChange();

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      window.addEventListener("resize", handleChange);
      return () => {
        media.removeEventListener("change", handleChange);
        window.removeEventListener("resize", handleChange);
      };
    }

    media.addListener(handleChange);
    window.addEventListener("resize", handleChange);
    return () => {
      media.removeListener(handleChange);
      window.removeEventListener("resize", handleChange);
    };
  }, [breakpoint]);

  return state;
}
