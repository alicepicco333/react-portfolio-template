import { useLayoutEffect, useEffect, useState } from "react";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Category → short label + pastel tone (FIELD/UNIT colour key)
const CATEGORY_META = {
  Design: { short: "Design", tone: "#F2C4CE" },
  Research: { short: "Research", tone: "#CFC6E8" },
  "Live Coding": { short: "Live coding", tone: "#C8D8BF" },
  "Work in Progress": { short: "Work in progress", tone: "#D7FF3C" },
  "Past Projects": { short: "Past projects", tone: "#A89F7E" },
};

// Prefix local /public paths with the deploy base path (GitHub Pages serves from a sub-folder).
export function withBase(src) {
  return src && src.startsWith("/") ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${src}` : src;
}

export function categoryMeta(category) {
  return CATEGORY_META[category] || { short: category, tone: "#BDB8AC" };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function ISOToDate(date) {
  if (date) {
    let convertDate = new Date(date);
    return (
      convertDate.getFullYear() +
      "-" +
      (convertDate.getMonth() + 1) +
      "-" +
      convertDate.getDate()
    );
  }
}

export function getRandomImage() {
  const randomImageUrl = [
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    "https://images.unsplash.com/photo-1638742385167-96fc60e12f59?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
    "https://images.unsplash.com/photo-1618367588411-d9a90fefa881?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    "https://images.unsplash.com/photo-1657295791913-5074c912398e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=996&q=80",
  ];
  return randomImageUrl[Math.floor(Math.random() * randomImageUrl.length)];
}

// Newest first; `date` is an ISO date used only for ordering, `dateLabel` is what is shown.
export const byDateDesc = (a, b) => (b.date || "").localeCompare(a.date || "");
