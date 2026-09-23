import React, { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../utils";

const GLYPHS = "#%&/<>{}[]=+*~01";

// Reveals `text` through scrambled glyphs. Pass `words` instead to
// cycle through several strings, each one resolving and holding for `hold` ms.
const ScrambleText = ({ text, words, className, delay = 0, hold = 3200, speed = 45 }) => {
  const list = words && words.length ? words : [text];
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(list[0]);
  const timers = useRef([]);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(list[0]);
      return undefined;
    }

    let cancelled = false;
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

    const run = (wordIndex) => {
      const target = list[wordIndex % list.length];
      let frame = 0;

      const step = () => {
        if (cancelled) return;
        const revealed = Math.floor(frame / 2);
        let out = "";
        for (let i = 0; i < target.length; i++) {
          out +=
            i < revealed || target[i] === " "
              ? target[i]
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplay(out);
        frame++;

        if (revealed < target.length) {
          later(step, speed);
        } else if (list.length > 1) {
          later(() => run(wordIndex + 1), hold);
        }
      };

      step();
    };

    later(() => run(0), delay);

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, delay, hold, speed, list.join("|")]);

  return (
    <span className={className} aria-label={list.join(", ")}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
};

export default ScrambleText;
