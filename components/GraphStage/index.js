import React, { useEffect, useRef, useState } from "react";
import PracticeMap from "../PracticeMap";
import { usePrefersReducedMotion } from "../../utils";
import { nodeOf } from "../Graph/data";

const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (t) => 1 - (1 - t) ** 3;

// The practice map as its own scene after the text-only hero. On desktop the scene is pinned
// while you scroll: the graph grows from a small seed, unfolds, then Works scrolls over it.
// Phones and reduced motion get a plain section. `?skill=<id>` opens the map on that skill.
const GraphStage = ({ projects }) => {
  const reducedMotion = usePrefersReducedMotion();
  const wrap = useRef(null);
  const [pinnedScene, setPinnedScene] = useState(false);
  const [progress, setProgress] = useState(1);
  const [skill, setSkill] = useState(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setPinnedScene(query.matches && !reducedMotion);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [reducedMotion]);

  useEffect(() => {
    if (!pinnedScene) {
      setProgress(1);
      return undefined;
    }
    const update = () => {
      const el = wrap.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      setProgress(range > 0 ? clamp(-rect.top / range) : 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pinnedScene]);

  // deep link from a project page: /?skill=dv — select it, and scroll to the unfolded map
  // once the scene has its final height
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("skill");
    if (!id || !nodeOf(id)) return undefined;
    setSkill(id);
    const timer = setTimeout(() => {
      const el = wrap.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + Math.max(0, range) * 0.75, behavior: "auto" });
    }, 250);
    return () => clearTimeout(timer);
  }, [pinnedScene]);

  const grow = ease(clamp(progress / 0.45));
  const unfold = clamp((progress - 0.15) / 0.45);
  const textIn = clamp((progress - 0.35) / 0.25);

  return (
    <section
      id="map"
      ref={wrap}
      aria-label="The practice, as a map"
      className={`relative border-t border-ink ${pinnedScene ? "h-[230vh]" : ""}`}
    >
      <div
        className={`grid gap-6 px-4 py-10 tablet:px-10 laptop:grid-cols-4 ${
          pinnedScene ? "sticky top-14 h-[calc(100vh-56px)] items-center py-6" : ""
        }`}
      >
        <div
          className="flex flex-col gap-4 laptop:self-start laptop:pt-4"
          style={pinnedScene ? { opacity: textIn, transform: `translateY(${(1 - textIn) * 16}px)` } : undefined}
        >
          <h2 className="fu-title text-phi1">The practice, as a map</h2>
          <span className="block h-[6px] w-14 bg-olive" aria-hidden="true" />
          <p className="max-w-[300px] text-[15px] leading-snug text-graphite">
            Each skill links to the ones it feeds into. Select one to unfold its tools and the projects where it shows up.
          </p>
        </div>

        <div className="flex justify-center laptop:col-span-3 laptop:h-full laptop:items-center">
          <div
            className="aspect-square w-full"
            style={
              pinnedScene
                ? {
                    width: "min(calc(100vh - 104px), 100%)",
                    transform: `scale(${0.08 + 0.92 * grow})`,
                    opacity: clamp(progress / 0.12),
                    transformOrigin: "50% 50%",
                  }
                : undefined
            }
          >
            <PracticeMap projects={projects} progress={pinnedScene ? unfold : null} initialSkill={skill} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GraphStage;
