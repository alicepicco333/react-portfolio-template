module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      mob: "375px",
      tablet: "768px",
      laptop: "1024px",
      desktop: "1280px",
      laptopl: "1440px",
    },
    extend: {
      colors: {
        bone: "#E8E4DA",
        paper: "#F1EEE7",
        ink: "#151613",
        olive: "#4B5238",
        khaki: "#A89F7E",
        concrete: "#BDB8AC",
        graphite: "#4A4B44",
        fieldgrey: "#6C6F63",
        pink: "#F2C4CE",
        lilac: "#CFC6E8",
        mint: "#C8D8BF",
        signal: "#D7FF3C",
      },
      fontFamily: {
        sans: ["Instrument Sans", "system-ui", "sans-serif"],
        mono: ["Instrument Sans", "system-ui", "sans-serif"],
      },
      gridTemplateColumns: {
        13: "repeat(13, minmax(0, 1fr))",
        golden: "61.8fr 38.2fr",
        "golden-rev": "38.2fr 61.8fr",
      },
      gridColumn: {
        "span-13": "span 13 / span 13",
      },
      // golden-ratio type scale: 16 × φⁿ
      fontSize: {
        phi1: "26px",
        phi2: "42px",
        phi3: "68px",
        phi4: "110px",
        phi5: "178px",
        phi6: "288px",
      },
    },
  },
  plugins: [],
};
