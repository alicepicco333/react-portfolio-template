import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { NODES, RING, CLUSTERS, labelOf, skillsOfProject } from "../Graph/data";
import Sigil, { SigilG } from "../Sigil";
import { categoryMeta, withBase, useIsomorphicLayoutEffect, usePrefersReducedMotion } from "../../utils";
import { relaxRects, textWidth } from "../../utils/layout";
import { scramble, drawIn } from "../../utils/motion";

const HALO = { paintOrder: "stroke", stroke: "rgb(var(--bone))", strokeWidth: 6, strokeLinejoin: "round" };
const skillIds = (id) => skillsOfProject(id).map((n) => n.id);
const yearOf = (p) => (p.date || "").slice(0, 4);
const shortTitle = (t) => t.split(" - ")[0];
const mapTitle = (p) => p.short || shortTitle(p.title);
const TYPES = ["Design", "Research", "Live Coding"];
const VIEWS = ["Grid", "Compass", "Wheel"];

// ——— compass: left = understanding, right = making; up = people, down = information ———
const MAKE = { ux: 1, vis: 1, ixd: 1, cc: 1, live: 1, perf: 1, dv: 0.6, anth: -1, ur: -0.6, hci: -0.3, cult: -0.8, sem: -0.7, onto: -0.9, arch: -0.6, dh: -0.8 };
const PEOP = { anth: 1, ur: 1, hci: 0.8, ux: 0.7, ixd: 0.6, perf: 0.8, live: 0.3, vis: 0.2, cc: -0.3, dv: -0.6, cult: -0.3, sem: -1, onto: -1, arch: -0.6, dh: -0.4 };
const C = { W: 1376, H: 960, PW: 1020 };
C.cx = C.PW / 2;
C.cy = C.H / 2;
C.sx = C.PW * 0.4;
C.sy = C.H * 0.4;
const QUADRANTS = [
  ["Field work", 24, 70, "start"],
  ["Interfaces", C.PW - 24, 70, "end"],
  ["Structures", 24, C.H - 40, "start"],
  ["Instruments", C.PW - 24, C.H - 40, "end"],
];

function compassLayout(projects) {
  const items = {};
  projects.forEach((p) => {
    const s = skillIds(p.id);
    const mx = s.reduce((a, k) => a + MAKE[k], 0) / s.length;
    const py = s.reduce((a, k) => a + PEOP[k], 0) / s.length;
    items[p.id] = [C.cx + mx * C.sx, C.cy - py * C.sy, -22, -22, 30 + textWidth(mapTitle(p), 16), 22];
  });
  const fixed = [
    [0, C.cy - 26, 190, C.cy + 4],
    [C.PW - 110, C.cy - 26, C.PW, C.cy + 4],
    [C.cx, 0, C.cx + 110, 32],
    [C.cx, C.H - 32, C.cx + 140, C.H],
    [0, 20, 300, 90],
    [C.PW - 300, 20, C.PW, 90],
    [0, C.H - 100, 300, C.H - 20],
    [C.PW - 330, C.H - 100, C.PW, C.H - 20],
    [C.cx - 3, 0, C.cx + 3, C.H],
    [0, C.cy - 3, C.PW, C.cy + 3],
  ];
  return relaxRects(items, { fixed, box: [10, 10, C.PW - 10, C.H - 10] });
}

// ——— wheel: projects pulled towards the skills they use (RadViz) ———
const Wh = { W: 1376, H: 1000, CX: 520, CY: 500, R: 360 };
const angleOf = (id) => -Math.PI / 2 + (2 * Math.PI * RING.indexOf(id)) / RING.length;
const anchorOf = (id) => [Wh.CX + Wh.R * Math.cos(angleOf(id)), Wh.CY + Wh.R * Math.sin(angleOf(id))];
const CLUSTER_TEXT = CLUSTERS.map((c) => {
  const am = c.skills.reduce((a, k) => a + angleOf(k), 0) / c.skills.length;
  const cos = Math.cos(am);
  const anchor = cos > 0.3 ? "end" : cos < -0.3 ? "start" : "middle";
  const x = Wh.CX + (Wh.R - 30) * cos;
  const y = Wh.CY + (Wh.R - 40) * Math.sin(am) + (Math.sin(am) < 0 ? 8 : 0);
  const w = c.label.length * 14.5;
  const left = anchor === "end" ? x - w : anchor === "start" ? x : x - w / 2;
  return { ...c, x, y, anchor, box: [left, y - 26, left + w, y + 8], arc: [angleOf(c.skills[0]) - 0.15, angleOf(c.skills[c.skills.length - 1]) + 0.15] };
});

function wheelLayout(projects) {
  const items = {};
  projects.forEach((p) => {
    const s = skillIds(p.id);
    const x = s.reduce((a, k) => a + anchorOf(k)[0], 0) / s.length;
    const y = s.reduce((a, k) => a + anchorOf(k)[1], 0) / s.length;
    const w = textWidth(mapTitle(p), 14);
    items[p.id] = [Wh.CX + (x - Wh.CX) * 0.78, Wh.CY + (y - Wh.CY) * 0.78, -Math.max(16, w / 2), -16, Math.max(16, w / 2), 38];
  });
  const inner = Wh.R * 0.78;
  return relaxRects(items, { fixed: CLUSTER_TEXT.map((c) => c.box), box: [Wh.CX - inner, Wh.CY - inner, Wh.CX + inner, Wh.CY + inner], pad: 7 });
}

// scale a fixed-size design to the width it is given
const Fit = ({ W, H, children }) => {
  const ref = useRef(null);
  const [scale, setScale] = useState(null);
  useIsomorphicLayoutEffect(() => {
    const measure = () => ref.current && setScale(Math.min(1, ref.current.clientWidth / W));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [W]);
  return (
    <div ref={ref} className="relative w-full" style={{ height: H * (scale || 1) }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale || 1})`, visibility: scale ? "visible" : "hidden" }}>
        {children}
      </div>
    </div>
  );
};

const Media = ({ project, className = "" }) => {
  const reduced = usePrefersReducedMotion();
  const motion = project.tileMotion && !reduced ? project.tileMotion : null;
  const src = motion || project.imageSrc;
  if (motion && motion.endsWith(".mp4")) {
    return <video src={withBase(motion)} poster={withBase(project.imageSrc)} className={className} autoPlay muted loop playsInline aria-label={project.title} />;
  }
  if (src) return <img src={withBase(src)} alt="" className={className} loading="lazy" draggable={false} />;
  return (
    <div className={`flex items-center justify-center bg-khaki ${className}`}>
      <Sigil skills={skillIds(project.id)} size={130} bg="rgb(var(--khaki))" width={2.5} className="work-bigsig" />
    </div>
  );
};

// the card beside the compass and the wheel
const ProjectCard = ({ project, where }) => (
  <div className="work-side flex flex-col border border-ink bg-paper text-[14px] leading-normal shadow-[6px_6px_0_rgb(var(--olive))]">
    <Media project={project} className="h-[190px] w-full border-b border-ink object-cover" />
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between font-mono text-[12px]">
        <span className="text-olive">
          {categoryMeta(project.category).short.toUpperCase()} · {yearOf(project)}
        </span>
        <span>{where}</span>
      </div>
      <span className="text-[22px] font-bold leading-tight">{shortTitle(project.title)}</span>
      <span>{project.description}</span>
      <span className="font-mono text-[12px] leading-relaxed text-graphite">{skillIds(project.id).map(labelOf).join(" · ")}</span>
      <Link href={`/projects/${project.id}`} className="font-semibold text-olive underline underline-offset-2 hover:text-ink">
        Read the story →
      </Link>
    </div>
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1 font-mono text-[11px] text-graphite">
    {label}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[40px] min-w-[150px] cursor-pointer border border-ink bg-paper px-2.5 font-mono text-[13px] text-ink"
    >
      {options.map(([v, t]) => (
        <option key={v} value={v}>
          {t}
        </option>
      ))}
    </select>
  </label>
);

const WorkExplorer = ({ projects, wipCount }) => {
  const [view, setView] = useState("Grid");
  const [skill, setSkill] = useState("all");
  const [type, setType] = useState("all");
  const [year, setYear] = useState("all");
  const [picked, setPicked] = useState(null);
  const rootRef = useRef(null);
  const chx = useRef(null);
  const chy = useRef(null);
  const readout = useRef(null);
  const sweep = useRef(null);

  const years = [...new Set(projects.map(yearOf))].sort().reverse();
  const matches = (p) => (skill === "all" || skillIds(p.id).includes(skill)) && (type === "all" || p.category === type) && (year === "all" || yearOf(p) === year);
  const shown = projects.filter(matches);
  const selected = shown.find((p) => p.id === picked) || shown[0] || projects[0];
  const compass = useMemo(() => compassLayout(projects), [projects]);
  const wheel = useMemo(() => wheelLayout(projects), [projects]);
  const filtered = skill !== "all" || type !== "all" || year !== "all";

  // each view makes its entrance when it is switched to
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = (s) => Array.from(root.querySelectorAll(s));
      if (view === "Grid") {
        gsap.from(q(".work-card"), { y: 40, opacity: 0, duration: 0.8, stagger: 0.05, ease: "power3.out", clearProps: "transform,opacity" });
        drawIn(gsap, q(".work-grid .work-bigsig .sigil-spoke"), { at: 0.35, step: 0.04, duration: 0.6 });
      }
      if (view === "Compass") {
        drawIn(gsap, q(".compass-axis"), { duration: 0.9 });
        q(".compass-pt").forEach((el, i) =>
          gsap.from(el, { x: C.cx - Number(el.dataset.x), y: C.cy - Number(el.dataset.y), opacity: 0, duration: 1.1, delay: 0.3 + i * 0.04, ease: "expo.out" })
        );
        q(".compass-quadrant").forEach((el, i) => scramble(gsap, el, 0.2 + i * 0.12));
      }
      if (view === "Wheel") {
        drawIn(gsap, q(".wheel-ring"), { duration: 1.2 });
        gsap.from(q(".wheel-anchor"), { scale: 0, transformOrigin: "50% 50%", duration: 0.4, stagger: 0.03, ease: "back.out(2)", delay: 0.3 });
        q(".wheel-pt").forEach((el, i) =>
          gsap.from(el, { x: Wh.CX - Number(el.dataset.x), y: Wh.CY - Number(el.dataset.y), opacity: 0, duration: 1.1, delay: 0.5 + i * 0.04, ease: "expo.out" })
        );
        q(".wheel-cluster").forEach((el, i) => scramble(gsap, el, 0.4 + i * 0.12));
        if (sweep.current) gsap.to(sweep.current, { rotation: 360, svgOrigin: `${Wh.CX} ${Wh.CY}`, duration: 18, repeat: -1, ease: "none" });
      }
      if (view !== "Grid") gsap.from(q(".work-side"), { x: 50, opacity: 0, duration: 0.8, delay: 0.5, ease: "power3.out" });
    });
    return () => mm.revert();
  }, [view]);

  // spokes from the picked project to its skills draw in on every pick
  useIsomorphicLayoutEffect(() => {
    if (view !== "Wheel") return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => drawIn(gsap, Array.from(rootRef.current.querySelectorAll(".wheel-spoke")), { step: 0.08, duration: 0.5 }));
    return () => mm.revert();
  }, [selected.id, view]);

  const onCompassMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) * C.PW) / r.width;
    const y = ((e.clientY - r.top) * C.H) / r.height;
    gsap.to(chx.current, { x, opacity: 0.8, duration: 0.25, ease: "power3.out", overwrite: true });
    gsap.to(chy.current, { y, opacity: 0.8, duration: 0.25, ease: "power3.out", overwrite: true });
    const mk = (x - C.cx) / C.sx;
    const pp = (C.cy - y) / C.sy;
    const f = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`;
    if (readout.current) readout.current.textContent = `${mk >= 0 ? "MAKING" : "UNDERSTANDING"} ${f(mk)} · ${pp >= 0 ? "PEOPLE" : "INFORMATION"} ${f(pp)}`;
  };
  const onCompassLeave = () => gsap.to([chx.current, chy.current], { opacity: 0, duration: 0.3 });

  const pointProps = (p) => ({
    tabIndex: matches(p) ? 0 : -1,
    role: "button",
    "aria-pressed": selected.id === p.id,
    "aria-label": `${mapTitle(p)}, ${categoryMeta(p.category).short}, ${yearOf(p)}`,
    onClick: () => matches(p) && setPicked(p.id),
    onMouseEnter: () => matches(p) && setPicked(p.id),
    onFocus: () => setPicked(p.id),
    onKeyDown: (e) => {
      if (e.key === "Enter") window.location.assign(withBase(`/projects/${p.id}/`));
    },
    style: { cursor: matches(p) ? "pointer" : "default", outline: "none", opacity: matches(p) ? 1 : 0.15, transition: "opacity .3s" },
  });

  return (
    <section id="work" ref={rootRef} className="scroll-mt-16 border-t border-ink px-4 pb-16 pt-8 tablet:px-8">
      <div className="flex flex-col gap-6 pb-6 desktop:flex-row desktop:items-end desktop:justify-between">
        <div className="fu-reveal flex flex-col gap-2">
          <h2 className="text-[40px] font-semibold leading-none tracking-[-0.02em]">All work</h2>
          <p className="font-mono text-[12px] text-graphite">
            {projects.length} projects · {wipCount} in progress · {years[years.length - 1]}–{years[0]}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Skill" value={skill} onChange={setSkill} options={[["all", "All skills"], ...NODES.map((n) => [n.id, n.label])]} />
          <Select label="Type" value={type} onChange={setType} options={[["all", "All types"], ...TYPES.map((t) => [t, categoryMeta(t).short])]} />
          <Select label="Year" value={year} onChange={setYear} options={[["all", "All years"], ...years.map((y) => [y, y])]} />
          <div className="hidden flex-col gap-1 font-mono text-[11px] text-graphite desktop:flex">
            View
            <div className="flex" role="group" aria-label="View">
              {VIEWS.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`-mr-px min-h-[40px] border border-ink px-3.5 font-mono text-[12px] transition-colors ${view === v ? "bg-olive text-white" : "bg-paper text-ink hover:bg-bone"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ——— grid (always on smaller screens) ——— */}
      <div className={view === "Grid" ? "" : "desktop:hidden"}>
        {shown.length ? (
          <ul className="work-grid grid gap-5 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4">
            {shown.map((p) => (
              <li key={p.id} className="work-card">
                <Link href={`/projects/${p.id}`} className="flex h-full flex-col border border-ink bg-paper">
                  <div className="aspect-[4/3] overflow-hidden border-b border-ink">
                    <Media project={p} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-grow flex-col gap-1.5 px-3.5 pb-3.5 pt-3">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-olive">
                        {categoryMeta(p.category).short.toUpperCase()} · {yearOf(p)}
                      </span>
                      <Sigil skills={skillIds(p.id)} size={26} bg="rgb(var(--paper))" className="work-mini" />
                    </div>
                    <h3 className="text-[18px] font-bold leading-tight">{shortTitle(p.title)}</h3>
                    <p className="text-[14px] leading-snug text-ink/85">{p.description}</p>
                    <p className="mt-auto pt-1.5 font-mono text-[11px] leading-relaxed text-graphite">{skillIds(p.id).map(labelOf).join(" · ")}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-10 text-[16px]">
            Nothing matches those filters.{" "}
            <button
              type="button"
              className="font-semibold text-olive underline"
              onClick={() => {
                setSkill("all");
                setType("all");
                setYear("all");
              }}
            >
              Clear filters
            </button>
          </p>
        )}
      </div>

      {/* ——— compass ——— */}
      {view === "Compass" && (
        <div className="hidden desktop:block">
          <Fit W={C.W} H={C.H + 40}>
            <svg
              viewBox={`0 0 ${C.PW} ${C.H}`}
              width={C.PW}
              height={C.H}
              className="absolute left-0 top-0"
              role="group"
              aria-label="Work compass: left is understanding, right is making; up is people, down is information"
              onMouseMove={onCompassMove}
              onMouseLeave={onCompassLeave}
            >
              <rect x="0" y="0" width={C.PW} height={C.H} fill="none" style={{ stroke: "rgb(var(--ink))" }} />
              {[1, 2, 3, 5, 6, 7].map((i) => (
                <g key={i} aria-hidden="true" style={{ stroke: "rgb(var(--concrete))" }} strokeWidth="0.6" strokeDasharray="1 5">
                  <line x1={(C.PW * i) / 8} y1="0" x2={(C.PW * i) / 8} y2={C.H} />
                  <line x1="0" y1={(C.H * i) / 8} x2={C.PW} y2={(C.H * i) / 8} />
                </g>
              ))}
              <line className="compass-axis" x1={C.cx} y1="0" x2={C.cx} y2={C.H} style={{ stroke: "rgb(var(--ink))" }} strokeWidth="1.5" />
              <line className="compass-axis" x1="0" y1={C.cy} x2={C.PW} y2={C.cy} style={{ stroke: "rgb(var(--ink))" }} strokeWidth="1.5" />
              <g fontFamily="JetBrains Mono, monospace" fontSize="12" style={{ fill: "rgb(var(--graphite))" }} aria-hidden="true">
                <text x="12" y={C.cy - 10}>← UNDERSTANDING</text>
                <text x={C.PW - 12} y={C.cy - 10} textAnchor="end">
                  MAKING →
                </text>
                <text x={C.cx + 10} y="22">↑ PEOPLE</text>
                <text x={C.cx + 10} y={C.H - 12}>↓ INFORMATION</text>
              </g>
              {QUADRANTS.map(([n, x, y, a]) => (
                <text key={n} className="compass-quadrant" x={x} y={y} textAnchor={a} fontFamily="JetBrains Mono, monospace" fontSize="26" fontWeight="500" letterSpacing="0.18em" style={{ fill: "rgb(var(--olive))" }} opacity="0.45" aria-hidden="true">
                  {n.toUpperCase()}
                </text>
              ))}
              <line ref={chx} x1="0" y1="0" x2="0" y2={C.H} style={{ stroke: "rgb(var(--olive))" }} strokeDasharray="3 3" opacity="0" aria-hidden="true" />
              <line ref={chy} x1="0" y1="0" x2={C.PW} y2="0" style={{ stroke: "rgb(var(--olive))" }} strokeDasharray="3 3" opacity="0" aria-hidden="true" />
              {projects.map((p) => {
                const [x, y] = compass[p.id];
                const on = selected.id === p.id;
                return (
                  <g key={p.id} className="compass-pt" data-x={x} data-y={y} {...pointProps(p)}>
                    {on && <circle cx={x} cy={y} r="27" style={{ fill: "rgb(var(--khaki))", stroke: "rgb(var(--olive))" }} strokeWidth="1.5" />}
                    <SigilG cx={x} cy={y} r={on ? 20 : 16} skills={skillIds(p.id)} />
                    <text x={x + (on ? 30 : 24)} y={y + 5} fontFamily="Inter Tight, sans-serif" fontSize={on ? 16 : 15} fontWeight={on ? 700 : 500} style={{ fill: on ? "rgb(var(--olive))" : "rgb(var(--ink))", ...HALO }}>
                      {mapTitle(p)}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute right-0 top-0 flex w-[330px] flex-col gap-5">
              <ProjectCard project={selected} where="Compass" />
              <p className="font-mono text-[12px] leading-relaxed text-graphite">
                Each project sits at the average of its skills. Left is understanding, right is making; up is people, down is information. Filters dim what does not match.
              </p>
              <p ref={readout} className="font-mono text-[12px] text-olive" aria-hidden="true">
                Move over the compass to read its axes
              </p>
            </div>
          </Fit>
        </div>
      )}

      {/* ——— wheel ——— */}
      {view === "Wheel" && (
        <div className="hidden desktop:block">
          <Fit W={Wh.W} H={Wh.H}>
            <svg viewBox={`0 0 ${Wh.CX * 2 + 40} ${Wh.H}`} width={Wh.CX * 2 + 40} height={Wh.H} className="absolute left-0 top-0" role="group" aria-label="Work wheel: each project is pulled towards the skills it uses">
              {CLUSTER_TEXT.map((c) => {
                const r = Wh.R - 12;
                const [a0, a1] = c.arc;
                return (
                  <g key={c.id} aria-hidden="true">
                    <path
                      d={`M ${Wh.CX + r * Math.cos(a0)} ${Wh.CY + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${Wh.CX + r * Math.cos(a1)} ${Wh.CY + r * Math.sin(a1)}`}
                      fill="none"
                      style={{ stroke: "rgb(var(--olive))" }}
                      strokeWidth="6"
                      opacity="0.16"
                    />
                    <text className="wheel-cluster" x={c.x} y={c.y} textAnchor={c.anchor} fontFamily="JetBrains Mono, monospace" fontSize="18" fontWeight="500" letterSpacing="0.16em" style={{ fill: "rgb(var(--olive))" }} opacity="0.6">
                      {c.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}
              {[0.33, 0.66].map((f) => (
                <circle key={f} cx={Wh.CX} cy={Wh.CY} r={Wh.R * f} fill="none" style={{ stroke: "rgb(var(--concrete))" }} strokeDasharray="1 5" aria-hidden="true" />
              ))}
              <circle className="wheel-ring" cx={Wh.CX} cy={Wh.CY} r={Wh.R} fill="none" style={{ stroke: "rgb(var(--ink))" }} strokeWidth="1.5" />
              <g ref={sweep} aria-hidden="true">
                <path
                  d={`M ${Wh.CX} ${Wh.CY} L ${Wh.CX} ${Wh.CY - Wh.R} A ${Wh.R} ${Wh.R} 0 0 0 ${Wh.CX - Wh.R * Math.sin(0.49)} ${Wh.CY - Wh.R * Math.cos(0.49)} Z`}
                  style={{ fill: "rgb(var(--olive))" }}
                  opacity="0.07"
                />
                <line x1={Wh.CX} y1={Wh.CY} x2={Wh.CX} y2={Wh.CY - Wh.R} style={{ stroke: "rgb(var(--olive))" }} strokeWidth="1.5" opacity="0.55" />
              </g>
              {skillIds(selected.id).map((k) => (
                <line key={k} className="wheel-spoke" x1={wheel[selected.id][0]} y1={wheel[selected.id][1]} x2={anchorOf(k)[0]} y2={anchorOf(k)[1]} style={{ stroke: "rgb(var(--olive))" }} strokeWidth="2" aria-hidden="true" />
              ))}
              {RING.map((k) => {
                const [x, y] = anchorOf(k);
                const a = angleOf(k);
                const on = skillIds(selected.id).includes(k);
                const lx = Wh.CX + (Wh.R + 22) * Math.cos(a);
                const ly = Wh.CY + (Wh.R + 22) * Math.sin(a);
                const anchor = Math.abs(Math.cos(a)) < 0.25 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
                const dy = Math.sin(a) < -0.9 ? -4 : Math.sin(a) > 0.9 ? 14 : 5;
                return (
                  <g key={k} aria-hidden="true">
                    <rect className="wheel-anchor" x={x - 7} y={y - 7} width="14" height="14" style={{ fill: on ? "rgb(var(--olive))" : "rgb(var(--bone))", stroke: on ? "rgb(var(--olive))" : "rgb(var(--ink))" }} strokeWidth="1.5" />
                    <text x={lx} y={ly + dy} textAnchor={anchor} fontFamily="Inter Tight, sans-serif" fontSize="15" fontWeight={on ? 700 : 400} style={{ fill: on ? "rgb(var(--olive))" : "rgb(var(--ink))" }}>
                      {labelOf(k)}
                    </text>
                  </g>
                );
              })}
              {projects.map((p) => {
                const [x, y] = wheel[p.id];
                const on = selected.id === p.id;
                const col = on ? "rgb(var(--olive))" : "rgb(var(--ink))";
                return (
                  <g key={p.id} className="wheel-pt" data-x={x} data-y={y} {...pointProps(p)}>
                    <SigilG cx={x} cy={y} r={on ? 20 : 14} skills={skillIds(p.id)} color={col} />
                    <text x={x} y={y + (on ? 38 : 32)} textAnchor="middle" fontFamily="Inter Tight, sans-serif" fontSize={on ? 15 : 14} fontWeight={on ? 700 : 500} style={{ fill: col, ...HALO }}>
                      {mapTitle(p)}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute right-0 top-5 flex w-[330px] flex-col gap-5">
              <ProjectCard project={selected} where="Wheel" />
              <p className="font-mono text-[12px] leading-relaxed text-graphite">
                Every project is pulled towards the skills it uses, like a weight on strings. Near the centre: projects that mix many skills. Near the rim: specialists.
              </p>
            </div>
          </Fit>
        </div>
      )}

      {filtered && view !== "Grid" && (
        <p className="mt-4 hidden font-mono text-[12px] text-graphite desktop:block">
          Showing {shown.length} of {projects.length}; the rest are dimmed.
        </p>
      )}
    </section>
  );
};

export default WorkExplorer;
