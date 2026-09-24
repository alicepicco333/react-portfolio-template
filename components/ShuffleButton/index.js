import React, { useEffect, useState } from "react";
import { DEFAULT_PALETTE, STORAGE_KEY, applyPalette, generatePalette } from "../../utils/palette";

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return null;
  }
};

const save = (palette) => {
  try {
    if (palette) localStorage.setItem(STORAGE_KEY, JSON.stringify(palette));
    else localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // storage unavailable (private window): the shuffle still works for this visit
  }
};

// Swaps the site's colour tokens for a new harmonic palette; the choice is remembered per visitor.
const ShuffleButton = ({ showName = true }) => {
  const [name, setName] = useState(DEFAULT_PALETTE.name);

  useEffect(() => {
    const saved = load();
    if (saved?.name) setName(saved.name);
  }, []);

  const shuffle = () => {
    const palette = generatePalette();
    applyPalette(palette);
    save(palette);
    setName(palette.name);
  };

  const reset = () => {
    applyPalette(DEFAULT_PALETTE);
    save(null);
    setName(DEFAULT_PALETTE.name);
  };

  const changed = name !== DEFAULT_PALETTE.name;

  return (
    <span className="flex items-center gap-3">
      <button type="button" onClick={shuffle} className="flex min-h-[44px] items-center font-medium hover:underline">
        Shuffle colours
      </button>
      {showName && (
        <span className="fu-meta hidden text-fieldgrey desktop:inline" aria-live="polite">
          {name}
        </span>
      )}
      {changed && (
        <button type="button" onClick={reset} className="fu-meta flex min-h-[44px] items-center text-fieldgrey hover:text-ink">
          Reset
        </button>
      )}
    </span>
  );
};

export default ShuffleButton;
