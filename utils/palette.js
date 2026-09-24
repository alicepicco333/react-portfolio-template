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
    khaki: "168 159 126",
    concrete: "189 184 172",
    graphite: "74 75 68",
    "field-grey": "96 99 88",
    pink: "242 196 206",
    lilac: "207 198 232",
    mint: "200 216 191",
    signal: "215 255 60",
  },
};

// Hue offsets per harmony: [olive (dark accent), signal, pastel 1, pastel 2, pastel 3]
const SCHEMES = [
  { name: "Analogous", offsets: [30, -30, 0, 30, -30] },
  { name: "Complementary", offsets: [0, 180, 0, 180, 20] },
  { name: "Split complementary", offsets: [0, 150, 150, 210, 0] },
  { name: "Triadic", offsets: [0, 120, 0, 120, 240] },
  { name: "Tetradic", offsets: [90, 180, 0, 90, 270] },
  { name: "Monochrome", offsets: [0, 0, 0, 0, 0] },
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

export function generatePalette(random = Math.random) {
  const scheme = SCHEMES[Math.floor(random() * SCHEMES.length)];
  const base = Math.round(random() * 360);
  const hue = (offset) => (base + offset + 360) % 360;
  const [oliveH, signalH, p1, p2, p3] = scheme.offsets.map(hue);
  const mono = scheme.name === "Monochrome";

  const bone = oklch(0.925, 0.022, base);
  const paper = oklch(0.955, 0.014, base);
  const ink = withContrast(0.2, 0.02, base, bone, 12, -1);
  const graphite = withContrast(0.42, 0.02, base, bone, 7, -1);
  const fieldGrey = withContrast(0.53, 0.025, base, bone, 4.6, -1);
  const concrete = oklch(0.8, 0.02, base);
  const khaki = oklch(0.72, 0.06, p3);
  const olive = withContrast(0.42, 0.07, oliveH, bone, 7, -1);
  // signal sits on olive and ink (map highlights, footer hover), so it stays very light
  const signal = withContrast(0.93, mono ? 0.12 : 0.2, signalH, olive, 5.5, 1);
  const pastel = (h, shift) => oklch(0.86, mono ? 0.03 + shift : 0.075, h);

  const vars = {
    bone,
    paper,
    ink,
    olive,
    khaki,
    concrete,
    graphite,
    "field-grey": fieldGrey,
    pink: pastel(p1, 0),
    lilac: pastel(p2, 0.02),
    mint: pastel(p3, 0.04),
    signal,
  };
  return {
    name: `${scheme.name} · ${base}°`,
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
