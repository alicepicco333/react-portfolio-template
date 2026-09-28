import React, { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { labelOf, skillsOfProject } from "../Graph/data";
import { SigilG } from "../Sigil";
import { useIsomorphicLayoutEffect } from "../../utils";

const skillIds = (id) => skillsOfProject(id).map((n) => n.id);

// Work that is still happening: dashed cards, and sigils that keep drawing themselves.
const InProgress = ({ projects }) => {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const root = ref.current;
      const q = (s, el = root) => Array.from(el.querySelectorAll(s));
      gsap.from(q(".wip-card"), { y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 80%", once: true } });
      q(".wip-ring").forEach((el, i) => gsap.to(el, { rotation: 360, transformOrigin: "50% 50%", duration: 22 + i * 4, repeat: -1, ease: "none" }));
      q(".wip-sigil").forEach((sg, i) => {
        const dots = q(".sigil-dot", sg);
        const edges = q(".sigil-edge", sg);
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, delay: 1 + i * 0.5 });
        tl.fromTo(dots, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, stagger: 0.2, ease: "back.out(2.5)" });
        edges.forEach((l, j) => {
          const length = l.getTotalLength();
          tl.fromTo(l, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 0.3 + j * 0.3);
        });
        tl.to([...dots, ...edges], { opacity: 0.2, duration: 0.8 }, "+=1.6").set([...dots, ...edges], { opacity: 1 });
      });
    });
    return () => mm.revert();
  }, []);

  if (!projects.length) return null;

  return (
    <section id="in-progress" ref={ref} className="scroll-mt-16 px-4 pb-20 tablet:px-8">
      <div className="flex flex-col gap-4 border-t border-ink pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em]">In progress</h2>
          <p className="font-mono text-[13px] text-graphite">{projects.length} projects · case studies still being written</p>
        </div>
        <ul className="grid gap-5 tablet:grid-cols-2 laptop:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id} className="wip-card">
              <Link href={`/projects/${p.id}`} className="work-lift flex h-full flex-col border border-dashed border-ink bg-bone">
                <div className="flex h-[150px] items-center justify-center border-b border-dashed border-ink">
                  <svg width="124" height="124" aria-hidden="true">
                    <circle className="wip-ring" cx="62" cy="62" r="58" fill="none" style={{ stroke: "rgb(var(--ink))" }} strokeDasharray="3 6" />
                    <SigilG className="wip-sigil" cx={62} cy={62} r={44} skills={skillIds(p.id)} color="rgb(var(--ink))" width={2.5} />
                  </svg>
                </div>
                <div className="flex flex-grow flex-col gap-1.5 px-3.5 pb-3.5 pt-3">
                  <span className="font-mono text-[13px] text-graphite">IN PROGRESS · STARTED {(p.date || "").slice(0, 4)}</span>
                  <h3 className="text-[18px] font-bold leading-tight">{p.title.split(" - ")[0]}</h3>
                  <p className="text-[15px] leading-snug text-ink/85">{p.description}</p>
                  <p className="mt-auto pt-1.5 font-mono text-[13px] leading-relaxed text-graphite">{skillIds(p.id).map(labelOf).join(" · ")}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default InProgress;
