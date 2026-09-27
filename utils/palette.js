// Colour shuffle: builds a harmonic palette for the site's colour tokens.
// Tokens are CSS variables holding "r g b" triplets (see styles/globals.css),
// so Tailwind classes like `bg-bone` or `text-bone/70` follow them.

export const STORAGE_KEY = "fu-palette";

// The original FIELD/UNIT palette.
export const DEFAULT_PALETTE = {
  name: "Field/Unit",
  vars: {
    bone: "232 228 218",
    paper: "241 238 231",
    ink: "21 22 19",
    olive: "75 82 56",
    khaki: "207 198 232",
    concrete: "189 184 172",
    graphite: "74 75 68",
    "field-grey": "96 99 88",
    pink: "207 198 232",
    lilac: "207 198 232",
    mint: "207 198 232",
    signal: "215 255 60",
  },
};

// Hue offsets from the base (background) hue for each role:
// panel = the dark accent field (map, primary buttons), signal = the vivid highlight,
// p1–p3 = the pastel tiles. Every harmony spreads the roles across the wheel.
const SCHEMES = [
  { name: "Complementary", panel: 180, signal: 30, p: [0, 180, 200] },
  { name: "Split complementary", panel: 150, signal: 210, p: [0, 150, 210] },
  { name: "Triadic", panel: 120, signal: 240, p: [0, 120, 240] },
  { name: "Tetradic", panel: 90, signal: 180, p: [0, 90, 270] },
  { name: "Clash", panel: 200, signal: 110, p: [60, 250, 310] },
  { name: "Off-key", panel: 140, signal: 280, p: [30, 170, 320] },
];

// --- OKLCH → sRGB -----------------------------------------------------------

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function oklchToLinearRgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

// Reduce chroma until the colour fits in sRGB, then return 0–255 channels.
function oklch(L, C, h) {
  let c = C;
  let rgb = oklchToLinearRgb(L, c, h);
  while (c > 0 && rgb.some((v) => v < -0.0005 || v > 1.0005)) {
    c -= 0.005;
    rgb = oklchToLinearRgb(L, Math.max(c, 0), h);
  }
  return rgb.map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255));
}

const luminance = ([r, g, b]) =>
  0.2126 * toLinear(r / 255) + 0.7152 * toLinear(g / 255) + 0.0722 * toLinear(b / 255);

export const contrast = (x, y) => {
  const [a, b] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (a + 0.05) / (b + 0.05);
};

// Walk lightness (darker or lighter) until the colour reaches `min` contrast against `against`.
function withContrast(L, C, h, against, min, direction) {
  let l = L;
  let rgb = oklch(l, C, h);
  while (contrast(rgb, against) < min && l > 0.02 && l < 0.99) {
    l += direction * 0.01;
    rgb = oklch(l, C, h);
  }
  return rgb;
}

// --- Palette ----------------------------------------------------------------

// Four colours, reused across sections: a background, a text colour, an accent field of the
// opposite polarity (the map, About) and a highlight that reads on that field. One tint serves
// the hero, Record and the image-less tiles. A shuffle may also invert the page: light text on
// a dark background, with a light accent field.
export function generatePalette(random = Math.random) {
  const scheme = SCHEMES[Math.floor(random() * SCHEMES.length)];
  const base = Math.round(random() * 360);
  const hue = (offset) => (((base + offset) % 360) + 360) % 360;
  const between = (lo, hi) => lo + random() * (hi - lo);
  const accentH = hue(scheme.panel);
  const signalH = hue(scheme.signal);
  const inverted = random() < 0.5;
  const d = inverted ? 1 : -1; // direction that moves text away from the background

  const bone = inverted ? oklch(between(0.19, 0.23), 0.04, accentH) : oklch(between(0.9, 0.93), between(0.03, 0.05), base);
  const paper = inverted ? oklch(0.25, 0.04, accentH) : oklch(0.955, 0.02, base);
  const ink = withContrast(inverted ? 0.92 : 0.24, 0.03, inverted ? base : accentH, bone, 12, d);
  const graphite = withContrast(inverted ? 0.8 : 0.42, 0.025, base, bone, 7, d);
  const fieldGrey = withContrast(inverted ? 0.7 : 0.52, 0.03, base, bone, 4.6, d);
  const concrete = oklch(inverted ? 0.36 : 0.8, 0.03, base);
  // the accent field has the opposite polarity to the page
  const olive = withContrast(inverted ? 0.72 : 0.5, between(0.1, 0.14), inverted ? base : accentH, bone, 6.5, d);
  const signal = withContrast(inverted ? 0.42 : 0.86, 0.15, signalH, olive, 4.5, -d);
  // one tint, same polarity as the page, carrying the accent hue
  const tint = withContrast(inverted ? 0.3 : 0.85, 0.05, accentH, ink, 8, -d);

  const vars = {
    bone,
    paper,
    ink,
    olive,
    khaki: tint,
    concrete,
    graphite,
    "field-grey": fieldGrey,
    pink: tint,
    lilac: tint,
    mint: tint,
    signal,
  };
  return {
    name: `${scheme.name}${inverted ? " · inverted" : ""} · ${base}°`,
    vars: Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, v.join(" ")])),
  };
}

export function applyPalette(palette) {
  const root = document.documentElement;
  Object.entries(palette.vars).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", `rgb(${palette.vars.bone})`);
}

// Inline script for _document: re-applies a saved palette before first paint.
export const RESTORE_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${STORAGE_KEY}"));if(p&&p.vars){for(var k in p.vars){document.documentElement.style.setProperty("--"+k,p.vars[k]);}}}catch(e){}`;
