import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import portfolioData from "../data/portfolio.json";
import { withBase } from "../utils";

const heroOf = Object.fromEntries(portfolioData.projects.map((p) => [p.id, p.highlightImage]));

// Card to case study: when a project link holds a thumbnail, the thumbnail grows into the project's
// hero image (View Transitions). Browsers without the API, reduced motion, motion switched off, new-tab
// and modified clicks all get the ordinary navigation.
function useProjectTransition() {
  const router = useRouter();
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (typeof document.startViewTransition !== "function") return;
      const html = document.documentElement;
      if (html.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const a = e.target.closest?.("a[href]");
      if (!a || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, window.location.href);
      const m = url.origin === window.location.origin && url.pathname.match(/\/projects\/([^/]+)\/?$/);
      const img = m && a.querySelector("img");
      if (!img) return;
      e.preventDefault();
      const src = heroOf[m[1]];
      const href = `/projects/${m[1]}`;
      // load the page's code and its hero first, so the morph lands on a picture and the swap is quick
      const loaded = Promise.race([
        Promise.all([
          router.prefetch(href).catch(() => {}),
          new Promise((done) => {
            if (!src) return done();
            const pre = new Image();
            pre.onload = pre.onerror = done;
            pre.src = withBase(src);
          }),
        ]),
        new Promise((done) => setTimeout(done, 1200)),
      ]);
      loaded.then(() => {
        img.style.viewTransitionName = "project-hero";
        html.dataset.vt = "1";
        // no requestAnimationFrame here: rendering is suppressed until this callback settles
        const t = document.startViewTransition(() => router.push(href));
        t.finished.finally(() => delete html.dataset.vt);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);
}

const App = ({ Component, pageProps }) => {
  useProjectTransition();
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Component {...pageProps} />
    </>
  );
};

export default App;
