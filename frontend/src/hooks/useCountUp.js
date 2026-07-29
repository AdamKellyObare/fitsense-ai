import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

// Animates numeric text from its previous value to a new one instead of
// snapping — respects prefers-reduced-motion.
export function useCountUp(value, { duration = 0.8 } = {}) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const controls = animate(from, to, {
      duration: reduceMotion ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });

    return () => controls.stop();
  }, [value, duration]);

  return display;
}
