import { useEffect, useState } from "react";

const MOBILE_MAX = 640;
const TABLET_MAX = 1024;

function classify(width) {
  if (width < MOBILE_MAX) return { isMobile: true, isTablet: false, isDesktop: false };
  if (width < TABLET_MAX) return { isMobile: false, isTablet: true, isDesktop: false };
  return { isMobile: false, isTablet: false, isDesktop: true };
}

export function useViewport() {
  const [viewport, setViewport] = useState(() => classify(window.innerWidth));

  useEffect(() => {
    const handleResize = () => setViewport(classify(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewport;
}
