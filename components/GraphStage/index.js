import React, { useEffect, useState } from "react";
import PracticeMap from "../PracticeMap";
import portfolioData from "../../data/portfolio.json";
import { nodeOf } from "../Graph/data";

// The first screen: the practice map, full-bleed and exactly one viewport tall, with the
// statement set inside the scene. `?skill=<id>` opens it on that skill.
const GraphStage = ({ projects }) => {
  const [skill, setSkill] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("skill");
    if (id && nodeOf(id)) setSkill(id);
  }, []);

  return (
    <section id="map" aria-label="The practice, as a map" className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-olive text-bone">
      <div className="absolute inset-0 pt-16">
        <PracticeMap projects={projects} initialSkill={skill} fill />
      </div>

      <div className="pointer-events-none absolute left-4 top-20 z-10 max-w-[560px] tablet:left-10 tablet:top-24">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-bone/80">
          {portfolioData.name} — researcher &amp; designer, Amsterdam
        </p>
        <h1 className="fu-display mt-3 text-[30px] leading-[1.02] tablet:text-[44px]">
          I research and design where <span className="text-signal">culture</span> meets <span className="text-signal">code</span> and{" "}
          <span className="text-signal">interfaces</span>.
        </h1>
      </div>

      <a
        href="#work"
        className="absolute bottom-5 right-4 z-10 text-[12px] font-semibold uppercase tracking-[0.14em] text-bone/80 hover:text-bone tablet:right-10"
      >
        Works ↓
      </a>
    </section>
  );
};

export default GraphStage;
