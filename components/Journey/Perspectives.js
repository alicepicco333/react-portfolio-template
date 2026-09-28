import React, { useState } from "react";
import Link from "next/link";
import portfolioData from "../../data/portfolio.json";
import { CLUSTERS, skillsOfProject } from "../Graph/data";
import { withBase } from "../../utils";
import { textWidth } from "../../utils/layout";

// Two alternative ways to read the timeline. Linear stays the default; these are opt-in views
// of the same data, each also available as plain lists for small screens and assistive tech.

export const MODELS = [
  { id: "linear", label: "Linear", note: "Left to right, oldest to newest: the usual way to read a career." },
  {
    id: "ahead",
    label: "Past in front",
    note: "In Aymara, the known past is spoken of as lying ahead, in view, and the unknown future behind (Núñez & Sweetser, 2006). Read from the top: what I have already done is in front of you; what comes next is behind.",
  },
  {
    id: "cycle",
    label: "Cycle",
    note: "Time read as a loop instead of a line. Each project and role sits in the phase it leans on most, and the work keeps coming back around: listen, order, count, shape, play, listen again.",
  },
];

const TINT = "color-mix(in srgb, rgb(var(--olive)) 16%, #fff)";
const yearOf = (p) => +(((p.dateLabel || "").match(/\d{4}/) || [(p.date || "").slice(0, 4)])[0]);
const timeOf = (p) => {
  const y = yearOf(p);
  const [dy, dm] = (p.date || "").split("-").map(Number);
  return y + (dy === y && dm ? (dm - 1) / 12 : 0.5);
};
const shortTitle = (p) => p.short || p.title.split(" - ")[0];

// the selector: native radios, so arrow keys move between options
export const ModelSwitch = ({ model, setModel }) => (
  <fieldset className="flex flex-col gap-1">
    <legend className="mb-1 font-mono text-[13px] text-graphite">Read time as</legend>
    <div className="flex">
      {MODELS.map((m) => (
        <label key={m.id} className="relative -mr-px">
          <input type="radio" name="time-model" value={m.id} checked={model === m.id} onChange={() => setModel(m.id)} className="peer sr-only" />
          <span className="flex min-h-[44px] cursor-pointer items-center border border-ink bg-paper px-4 font-mono text-[14px] text-ink hover:bg-bone peer-checked:bg-ink peer-checked:text-bone peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-olive">
            {m.label}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);

// items of one chapter, oldest first
export const chapterItems = (c, layer, projects) => {
  const { resume } = portfolioData;
  const inChapter = (t) => t >= c.from && t < c.to;
  return [
    ...(layer === "studies" ? resume.educationList.filter((e) => inChapter(e.start)).map((e) => ({ t: e.start, kind: "Study", label: e.name, dates: e.dates })) : []),
    ...(layer === "roles" ? resume.experiences.filter((e) => inChapter(e.start)).map((e) => ({ t: e.start, kind: "Role", label: e.position, dates: e.dates })) : []),
    ...projects.filter((p) => inChapter(timeOf(p))).map((p) => ({ t: timeOf(p), kind: "Project", label: shortTitle(p), dates: String(yearOf(p)), href: `/projects/${p.id}` })),
  ].sort((a, b) => a.t - b.t);
};

// ——— Past in front: the earliest chapter is nearest and largest; later ones recede ———
export const Ahead = ({ layer, projects }) => {
  const { chapters } = portfolioData.journey;
  const n = chapters.length;
  return (
    <div className="flex flex-col">
      <p className="mb-4 flex items-center gap-2 font-mono text-[13px] text-graphite">
        <span aria-hidden="true">↑</span> In front of you: the past, in view
      </p>
      <ol className="flex flex-col gap-0">
        {chapters.map((c, i) => {
          const depth = i / (n - 1); // 0 = nearest (oldest), 1 = furthest back (latest)
          const items = chapterItems(c, layer, projects);
          return (
            <li
              key={c.title}
              className="border-t border-ink py-5"
              style={{ marginLeft: `${depth * 12}%`, marginRight: `${depth * 12}%` }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold tracking-[-0.02em]" style={{ fontSize: `${34 - depth * 12}px`, lineHeight: 1.1 }}>
                  {c.title}
                </h3>
                <span className="font-mono text-[13px] text-graphite">{`${c.from}–${c.to > 2026 ? "now" : c.to}`}</span>
              </div>
              <p className="mt-2 max-w-[720px] leading-snug" style={{ fontSize: `${18 - depth * 2}px` }}>
                {c.text}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {items.map((it) =>
                  it.href ? (
                    <li key={it.kind + it.label}>
                      <Link href={it.href} className="work-lift inline-flex min-h-[36px] items-center border border-ink bg-paper px-3 text-[15px] font-medium hover:border-olive hover:text-olive">
                        {it.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={it.kind + it.label} className="inline-flex min-h-[36px] items-center gap-2 border border-concrete bg-white px-3 text-[15px] text-graphite">
                      <span className="font-mono text-[12px] uppercase">{it.kind}</span>
                      {it.label}
                    </li>
                  )
                )}
              </ul>
            </li>
          );
        })}
      </ol>
      <div className="mx-[12%] mt-2 flex flex-wrap items-center justify-between gap-3 border border-dashed border-ink px-5 py-4" style={{ marginLeft: "14%", marginRight: "14%" }}>
        <p className="text-[16px]">
          <span className="font-mono text-[13px] text-graphite">↓ Behind you: </span>
          what comes next, not yet in view.
        </p>
        <a href="#contact" className="font-semibold text-olive underline underline-offset-2 hover:text-ink">
          It could involve your team →
        </a>
      </div>
    </div>
  );
};

// ——— Cycle: the five clusters as phases of one loop ———
const PHASE_VERB = { listening: "listen", ordering: "order", counting: "count", shaping: "shape", playing: "play" };
const phaseOf = (skills) => {
  let best = null;
  CLUSTERS.forEach((c) => {
    const k = c.skills.filter((s) => skills.includes(s)).length;
    if (k && (!best || k > best.k)) best = { id: c.id, k };
  });
  return best?.id;
};
// the loop, in reading order (the same for the ring and the list)
const LOOP = ["listening", "ordering", "counting", "shaping", "playing"];
// positions around the loop (clockwise, in SVG degrees), chosen so no column hits the top edge
const ANGLE = { listening: 162, ordering: 234, counting: 306, shaping: 18, playing: 90 };
const CW = 1200;
const CH = 710;
const CX = 600;
const CY = 360;
const R = 150;
const pt = (deg, r) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)];

const cycleData = (projects) => {
  const byPhase = Object.fromEntries(CLUSTERS.map((c) => [c.id, []]));
  projects.forEach((p) => {
    const ph = phaseOf(skillsOfProject(p.id).map((n) => n.id));
    if (ph) byPhase[ph].push({ key: `p${p.id}`, label: shortTitle(p), href: `/projects/${p.id}`, kind: "project" });
  });
  portfolioData.resume.experiences.forEach((r) => {
    const ph = phaseOf(r.skills || []);
    if (ph) byPhase[ph].push({ key: `r${r.id}`, label: r.short, kind: "role", title: `${r.position} (${r.dates})` });
  });
  return byPhase;
};

export const Cycle = ({ projects }) => {
  const [hot, setHot] = useState(null);
  const byPhase = cycleData(projects);
  const order = LOOP;
  return (
    <>
      {/* large screens: the ring */}
      <div className="hidden desktop:block">
        <svg viewBox={`0 0 ${CW} ${CH}`} className="h-auto w-full" role="group" aria-label="Projects and roles arranged on a loop of five phases: listen, order, count, shape, play">
          <defs>
            <marker id="cycle-arrow" viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M0,-4L8,0L0,4" style={{ fill: "rgb(var(--olive))" }} />
            </marker>
          </defs>
          <circle cx={CX} cy={CY} r={R} fill="none" style={{ stroke: "rgb(var(--concrete))" }} strokeWidth="1" aria-hidden="true" />
          {order.map((id, i) => {
            // clockwise from this phase to the next, leaving room for the two labels
            const a0 = ANGLE[id] + 22;
            let a1 = ANGLE[order[(i + 1) % order.length]] - 22;
            while (a1 <= a0) a1 += 360;
            const steps = 24;
            const d = Array.from({ length: steps + 1 }, (_, k) => pt(a0 + ((a1 - a0) * k) / steps, R))
              .map(([x, y], k) => `${k ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`)
              .join(" ");
            return <path key={id} d={d} fill="none" style={{ stroke: "rgb(var(--olive))" }} strokeWidth="1.5" markerEnd="url(#cycle-arrow)" aria-hidden="true" />;
          })}
          <text x={CX} y={CY - 6} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" style={{ fill: "rgb(var(--graphite))" }} aria-hidden="true">
            one loop,
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" style={{ fill: "rgb(var(--graphite))" }} aria-hidden="true">
            read clockwise ↻
          </text>
          {order.map((id) => {
            const c = CLUSTERS.find((x) => x.id === id);
            const [nx, ny] = pt(ANGLE[id], R);
            const cos = Math.cos((ANGLE[id] * Math.PI) / 180);
            const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
            const items = byPhase[id];
            const [ax, ay] = pt(ANGLE[id], R + 100);
            const down = ANGLE[id] === 90;
            const y0 = down ? ay : ay - ((items.length - 1) * 34) / 2;
            const label = c.label.toUpperCase();
            const lw = textWidth(label, 13, true) + 18;
            return (
              <g key={id}>
                <rect x={nx - lw / 2} y={ny - 13} width={lw} height="26" style={{ fill: "rgb(var(--olive))" }} aria-hidden="true" />
                <text x={nx} y={ny + 5} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" style={{ fill: "#fff" }} aria-hidden="true">
                  {label}
                </text>
                {items.map((it, j) => {
                  const w = textWidth(it.label, 15) * 1.06 + 20;
                  const y = y0 + j * 34;
                  const x = anchor === "start" ? ax : anchor === "end" ? ax - w : ax - w / 2;
                  const over = hot === it.key;
                  const role = it.kind === "role";
                  const box = (
                    <>
                      <rect
                        x={x}
                        y={y - 14}
                        width={w}
                        height="28"
                        style={{
                          fill: over ? TINT : role ? "#fff" : "rgb(var(--paper))",
                          stroke: over ? "rgb(var(--olive))" : role ? "rgb(var(--concrete))" : "rgb(var(--ink))",
                          transition: "fill .2s",
                        }}
                        strokeWidth={over ? 2.5 : role ? 1.5 : 1}
                      />
                      <text
                        x={x + w / 2}
                        y={y + 5}
                        textAnchor="middle"
                        fontFamily="Inter Tight, sans-serif"
                        fontSize="15"
                        fontWeight={role ? 400 : 500}
                        style={{ fill: over ? "rgb(var(--olive))" : role ? "rgb(var(--graphite))" : "rgb(var(--ink))" }}
                      >
                        {it.label}
                      </text>
                    </>
                  );
                  return it.href ? (
                    <a
                      key={it.key}
                      href={withBase(`${it.href}/`)}
                      aria-label={`${it.label}, ${c.label} phase`}
                      onMouseEnter={() => setHot(it.key)}
                      onMouseLeave={() => setHot(null)}
                      onFocus={() => setHot(it.key)}
                      onBlur={() => setHot(null)}
                    >
                      {box}
                    </a>
                  ) : (
                    <g key={it.key} tabIndex={0} role="img" aria-label={`Role: ${it.title}, ${c.label} phase`} onMouseEnter={() => setHot(it.key)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(it.key)} onBlur={() => setHot(null)}>
                      <title>{it.title}</title>
                      {box}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      {/* smaller screens and a plain reading order: the same loop as a list */}
      <ol className="flex flex-col gap-5 desktop:hidden">
        {order.map((id, i) => {
          const c = CLUSTERS.find((x) => x.id === id);
          return (
            <li key={id} className="border-l-2 border-olive pl-4">
              <h3 className="text-[20px] font-bold">
                {i + 1}. {c.label} <span className="font-mono text-[13px] font-normal text-graphite">· {PHASE_VERB[id]}</span>
              </h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {byPhase[id].map((it) => (
                  <li key={it.key} className="text-[15px]">
                    {it.href ? (
                      <Link href={it.href} className="font-semibold underline underline-offset-2">
                        {it.label}
                      </Link>
                    ) : (
                      <span className="text-graphite">
                        <span className="font-mono text-[12px] uppercase">Role </span>
                        {it.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
        <li className="pl-4 font-mono text-[13px] text-graphite">↻ and back to Listening</li>
      </ol>
    </>
  );
};
