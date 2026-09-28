import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { gsap } from "gsap";
import {
  NODES,
  EDGES,
  neighbours,
  nodeOf,
  labelOf,
  skillsOfProject,
  CLUSTERS,
  clusterOf,
  SKILL_NOTES,
  MAP,
  MAP_NARROW,
} from "../Graph/data";
import { SigilG } from "../Sigil";
import { useIsomorphicLayoutEffect } from "../../utils";
import { textWidth, overlapArea } from "../../utils/layout";
import { scramble, drawIn } from "../../utils/motion";

const shortTitle = (title) => title.split(" - ")[0];
const mapTitle = (p) => p.short || shortTitle(p.title);
const skillIds = (projectId) => skillsOfProject(projectId).map((n) => n.id);
const HALO = { paintOrder: "stroke", stroke: "rgb(var(--bone))", strokeWidth: 6, strokeLinejoin: "round" };

// ——— desktop geometry ———
function labelBox(id) {
  const [x, y] = MAP.pos[id];
  const [dx, dy, anchor] = MAP.label[id];
  const w = textWidth(labelOf(id), 18) * 1.08;
  const left = anchor === "end" ? x + dx - w : x + dx;
  return [left, y + dy - 16, left + w, y + dy + 5];
}
const nodeBox = (id) => [MAP.pos[id][0] - 14, MAP.pos[id][1] - 14, MAP.pos[id][0] + 14, MAP.pos[id][1] + 14];
const clusterBox = (c) => {
  const [x, y] = MAP.clusters[c.id];
  return [x, y - 22, x + textWidth(c.label, 22, true) * 1.2, y + 4];
};
const STATIC_BOXES = [...NODES.map((n) => labelBox(n.id)), ...NODES.map((n) => nodeBox(n.id)), ...CLUSTERS.map(clusterBox), ...MAP.reserved];

// Put a skill's tools (inner arc) and projects (outer arc) on the side of the node with the
// most free room: every direction is scored by how much it would cover or leave the frame.
const grow = ([a, b, c, d], m) => [a - m, b - m, c + m, d + m];
const cost = (boxes, obstacles) => {
  let score = 0;
  boxes.forEach((b, i) => {
    if (b[0] < 8 || b[1] < 8 || b[2] > MAP.W - 8 || b[3] > MAP.H - 8) score += 1e6;
    obstacles.forEach((o) => {
      score += overlapArea(b, o);
    });
    boxes.slice(i + 1).forEach((o) => {
      score += overlapArea(b, o) * 2;
    });
  });
  return score;
};

// Projects first: try every direction, radius and spread and keep the one that covers nothing.
// Then tools, around everything placed so far.
function fanLayout(id, tools, works) {
  const [ox, oy] = MAP.pos[id];
  let leaves = null;
  for (let deg = 0; deg < 360; deg += 5) {
    const a = (deg * Math.PI) / 180;
    [180, 210, 245, 285, 320].forEach((rl) => {
      [0.22, 0.3, 0.4, 0.55].forEach((spread) => {
        const pts = works.map((p, i) => {
          const b = a + (i - (works.length - 1) / 2) * spread;
          const x = ox + rl * Math.cos(b);
          const y = oy + rl * Math.sin(b);
          const right = Math.cos(b) >= -0.2;
          const w = textWidth(`${mapTitle(p)} ↗`, 15) * 1.12 + 6;
          return { p, x, y, right, box: grow(right ? [x - 19, y - 19, x + 26 + w, y + 19] : [x - 26 - w, y - 19, x + 19, y + 19], 6) };
        });
        const score = cost(pts.map((o) => o.box), STATIC_BOXES);
        if (!leaves || score < leaves.score) leaves = { score, pts };
      });
    });
  }
  const placed = [...STATIC_BOXES, ...leaves.pts.map((o) => o.box)];
  let toolsBest = null;
  for (let deg = 0; deg < 360; deg += 5) {
    const a = (deg * Math.PI) / 180;
    [75, 95, 110, 130, 150, 175, 205, 240].forEach((rt) => {
      [0.34, 0.26, 0.45, 0.6].forEach((spread) => {
        const pts = tools.map((t, i) => {
          const b = a + (i - (tools.length - 1) / 2) * spread;
          const x = ox + rt * Math.cos(b);
          const y = oy + rt * Math.sin(b);
          const w = Math.max(24, textWidth(t, 13, true) * 1.1);
          return { t, x, y, box: grow([x - w / 2 - 2, y - 8, x + w / 2 + 2, y + 30], 6) };
        });
        const score = cost(pts.map((o) => o.box), placed);
        if (!toolsBest || score < toolsBest.score) toolsBest = { score, pts };
      });
    });
  }
  return { toolPts: toolsBest.pts, leafPts: leaves.pts };
}

const SkillMap = ({ projects }) => {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState("dv");
  const [sheet, setSheet] = useState(null); // phones
  const [fit, setFit] = useState(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const narrowRef = useRef(null);
  const rulerX = useRef(null);
  const rulerY = useRef(null);
  const readout = useRef(null);
  const sheetRef = useRef(null);
  const active = hovered || pinned;

  // `?skill=<id>` opens the map on that skill
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("skill");
    if (id && nodeOf(id)) setPinned(id);
  }, []);

  // scale the 1440 × 920 stage to whatever room the first screen has
  useEffect(() => {
    const measure = () => {
      const el = frameRef.current;
      if (!el) return;
      setFit(Math.min(el.clientWidth / MAP.W, el.clientHeight / MAP.H));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // phones: focus the sheet, Escape closes it
  useEffect(() => {
    if (!sheet) return undefined;
    sheetRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setSheet(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const workOf = (id) => nodeOf(id).work.map((pid) => projects.find((p) => p.id === pid)).filter(Boolean);
  const activeNode = active ? nodeOf(active) : null;
  const activeWork = activeNode ? workOf(active) : [];
  const fan = useMemo(() => (activeNode ? fanLayout(active, activeNode.tools, activeWork) : null), [active]); // eslint-disable-line react-hooks/exhaustive-deps
  const lit = activeNode ? new Set(neighbours(active)) : new Set();

  // ——— motion ———
  useIsomorphicLayoutEffect(() => {
    if (!fit) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const s = stageRef.current;
      if (s && s.offsetParent !== null) {
        const q = (sel) => Array.from(s.querySelectorAll(sel));
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(q(".map-intro > *"), { y: 26, opacity: 0, duration: 0.9, stagger: 0.1 }, 0);
        drawIn(gsap, q(".map-edge"), { at: 0.25, step: 0.035, duration: 0.7 });
        tl.from(q(".map-node"), { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.035, ease: "back.out(2.2)" }, 0.35);
        tl.from(q(".map-label"), { opacity: 0, y: 6, duration: 0.5, stagger: 0.025 }, 0.7);
        q(".map-cluster").forEach((el, i) => scramble(gsap, el, 0.9 + i * 0.18));
        tl.from(q(".map-card"), { x: 60, opacity: 0, duration: 0.8 }, 1.4);
        tl.from(q(".map-legend > *"), { opacity: 0, y: 8, duration: 0.4, stagger: 0.05 }, 1.6);
        gsap.to(q(".map-ghost"), { rotation: 360, transformOrigin: "50% 50%", duration: 16, repeat: -1, ease: "none" });
      }
      const n = narrowRef.current;
      if (n && n.offsetParent !== null) {
        const q = (sel) => Array.from(n.querySelectorAll(sel));
        gsap.from(q(".map-intro > *"), { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
        drawIn(gsap, q(".map-edge"), { at: 0.2, step: 0.03, duration: 0.6 });
        gsap.from(q(".map-node"), { scale: 0, transformOrigin: "50% 50%", duration: 0.45, stagger: 0.03, delay: 0.3, ease: "back.out(2)" });
      }
    });
    return () => mm.revert();
  }, [fit !== null]);

  // new skill: fan its tools and projects out, and pulse the node
  useIsomorphicLayoutEffect(() => {
    if (!fit || !active) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const s = stageRef.current;
      if (!s) return;
      const [x, y] = MAP.pos[active];
      gsap.from(s.querySelectorAll(".fan-item"), {
        x: (i, el) => x - Number(el.dataset.x),
        y: (i, el) => y - Number(el.dataset.y),
        scale: 0.3,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "expo.out",
      });
      drawIn(gsap, Array.from(s.querySelectorAll(".fan-line")), { duration: 0.45 });
      gsap.fromTo(s.querySelectorAll(".map-pulse"), { attr: { r: 14 }, opacity: 0.7 }, { attr: { r: 46 }, opacity: 0, duration: 2, repeat: -1, ease: "power1.out" });
    });
    return () => mm.revert();
  }, [active, fit]);

  // park the rulers on the pinned skill until the pointer moves
  useEffect(() => {
    if (!fit || !rulerX.current || !pinned) return;
    gsap.set(rulerX.current, { x: MAP.pos[pinned][0] });
    gsap.set(rulerY.current, { y: MAP.pos[pinned][1] });
  }, [fit, pinned]);

  // rulers along the frame follow the pointer, with a live readout
  const onPointerMove = (event) => {
    const s = stageRef.current;
    if (!s || !rulerX.current) return;
    const r = s.getBoundingClientRect();
    const x = ((event.clientX - r.left) * MAP.W) / r.width;
    const y = ((event.clientY - r.top) * MAP.H) / r.height;
    gsap.to(rulerX.current, { x, duration: 0.35, ease: "power3.out", overwrite: true });
    gsap.to(rulerY.current, { y, duration: 0.35, ease: "power3.out", overwrite: true });
    if (readout.current) readout.current.textContent = `X ${String(Math.round(x)).padStart(4, "0")} · Y ${String(Math.round(y)).padStart(4, "0")}`;
  };

  const toggle = (id) => setPinned((current) => (current === id ? null : id));
  const skillLabel = (id) => `${labelOf(id)}: ${nodeOf(id).tools.join(", ")}; used in ${workOf(id).length} projects`;
  const nodeProps = (label, onSelect) => ({
    tabIndex: 0,
    role: "button",
    "aria-label": label,
    onClick: onSelect,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    },
    style: { cursor: "pointer", outline: "none" },
  });
  const goTo = (id) => router.push(`/projects/${id}`);
  const [ax, ay] = active ? MAP.pos[active] : [0, 0];

  return (
    <section id="map" aria-label="My practice, as a map" className="relative scroll-mt-16 bg-bone">
      {/* ——— desktop and tablet: the fixed stage ——— */}
      <div ref={frameRef} className="relative hidden h-[calc(100svh-64px)] min-h-[560px] w-full map:block" onPointerMove={onPointerMove}>
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: MAP.W * (fit || 1), height: MAP.H * (fit || 1), transform: "translate(-50%, -50%)", visibility: fit ? "visible" : "hidden" }}
        >
          <div ref={stageRef} className="absolute left-0 top-0 origin-top-left" style={{ width: MAP.W, height: MAP.H, transform: `scale(${fit || 1})` }}>
            <svg viewBox={`0 0 ${MAP.W} ${MAP.H}`} className="absolute inset-0 h-full w-full" role="group" aria-label="Skills, linked where they feed into each other. Select one to see its tools and projects.">
              <g aria-hidden="true">
                {Array.from({ length: 35 }, (_, i) => (i + 1) * 40).map((x) => (
                  <line key={`tx${x}`} x1={x} y1="0" x2={x} y2={x % 200 ? 8 : 14} style={{ stroke: "rgb(var(--concrete))" }} />
                ))}
                {Array.from({ length: 22 }, (_, i) => (i + 1) * 40).map((y) => (
                  <line key={`ty${y}`} x1="0" y1={y} x2={y % 200 ? 8 : 14} y2={y} style={{ stroke: "rgb(var(--concrete))" }} />
                ))}
                <g ref={rulerX}>
                  <path d="M -6 0 L 6 0 L 0 10 Z" style={{ fill: "rgb(var(--olive))" }} />
                </g>
                <g ref={rulerY}>
                  <path d="M 0 -6 L 0 6 L 10 0 Z" style={{ fill: "rgb(var(--olive))" }} />
                </g>
                {CLUSTERS.map((c) => (
                  <text
                    key={c.id}
                    className="map-cluster"
                    x={MAP.clusters[c.id][0]}
                    y={MAP.clusters[c.id][1]}
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="22"
                    fontWeight="500"
                    letterSpacing="0.18em"
                    style={{ fill: "rgb(var(--olive))" }}
                    opacity={active && clusterOf(active).id === c.id ? 0.85 : 0.45}
                  >
                    {c.label.toUpperCase()}
                  </text>
                ))}
              </g>

              <g aria-hidden="true">
                {EDGES.map(([a, b]) => {
                  const hot = active && (a === active || b === active);
                  const [x1, y1] = MAP.pos[a];
                  const [x2, y2] = MAP.pos[b];
                  return (
                    <line
                      key={`${a}-${b}`}
                      className="map-edge"
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      style={{ stroke: hot ? "rgb(var(--olive))" : "rgb(var(--ink))", transition: "stroke .3s, stroke-width .3s, opacity .3s" }}
                      strokeWidth={hot ? 3 : 1}
                      opacity={hot ? 1 : 0.5}
                    />
                  );
                })}
                <line x1={MAP.pos.vis[0]} y1={MAP.pos.vis[1]} x2={MAP.ghost[0]} y2={MAP.ghost[1]} style={{ stroke: "rgb(var(--ink))" }} strokeDasharray="4 5" />
                <line x1={MAP.pos.perf[0]} y1={MAP.pos.perf[1]} x2={MAP.ghost[0]} y2={MAP.ghost[1]} style={{ stroke: "rgb(var(--ink))" }} strokeDasharray="4 5" />
              </g>

              <a href="#contact" aria-label="Next node: your team. Get in touch">
                <circle className="map-ghost" cx={MAP.ghost[0]} cy={MAP.ghost[1]} r="16" style={{ fill: "rgb(var(--bone))", stroke: "rgb(var(--ink))" }} strokeDasharray="3 4" />
                <text x={MAP.ghost[0]} y={MAP.ghost[1] + 5} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" style={{ fill: "rgb(var(--ink))" }}>
                  ?
                </text>
                <text x={MAP.ghost[0] + 26} y={MAP.ghost[1] - 4} fontFamily="Inter Tight, sans-serif" fontSize="15" fontWeight="600" style={{ fill: "rgb(var(--ink))" }}>
                  Next node: your team
                </text>
                <text x={MAP.ghost[0] + 26} y={MAP.ghost[1] + 16} fontFamily="JetBrains Mono, monospace" fontSize="12" textDecoration="underline" style={{ fill: "rgb(var(--olive))" }}>
                  get in touch →
                </text>
              </a>

              {fan && (
                <g key={active}>
                  {fan.toolPts.map(({ t, x, y }) => (
                    <g key={`t-${t}`} className="fan-item" data-x={x} data-y={y} aria-hidden="true">
                      <line x1={ax} y1={ay} x2={x} y2={y} style={{ stroke: "rgb(var(--olive))" }} strokeDasharray="2 4" />
                      <rect x={x - 5} y={y - 5} width="10" height="10" transform={`rotate(45 ${x} ${y})`} style={{ fill: "rgb(var(--bone))", stroke: "rgb(var(--olive))" }} strokeWidth="1.5" />
                      <text x={x} y={y + 24} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" style={{ fill: "rgb(var(--olive))", ...HALO }}>
                        {t}
                      </text>
                    </g>
                  ))}
                  {fan.leafPts.map(({ p, x, y, right }) => (
                    <g key={`w-${p.id}`} className="fan-item" data-x={x} data-y={y} {...nodeProps(`Open ${mapTitle(p)}`, () => goTo(p.id))} role="link">
                      <line className="fan-line" x1={ax} y1={ay} x2={x} y2={y} style={{ stroke: "rgb(var(--olive))" }} strokeWidth="1.5" />
                      <SigilG cx={x} cy={y} r={17} skills={skillIds(p.id)} />
                      <text
                        x={right ? x + 26 : x - 26}
                        y={y + 5}
                        textAnchor={right ? "start" : "end"}
                        fontFamily="Inter Tight, sans-serif"
                        fontSize="15"
                        fontWeight="600"
                        className="underline-offset-2 hover:underline"
                        style={{ fill: "rgb(var(--ink))", ...HALO }}
                      >
                        {mapTitle(p)} ↗
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {NODES.map((n) => {
                const [x, y] = MAP.pos[n.id];
                const [dx, dy, anchor] = MAP.label[n.id];
                const isActive = active === n.id;
                const isLit = lit.has(n.id);
                const size = isActive ? 26 : 12;
                return (
                  <g
                    key={n.id}
                    {...nodeProps(skillLabel(n.id), () => toggle(n.id))}
                    aria-pressed={pinned === n.id}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(n.id)}
                    onBlur={() => setHovered(null)}
                  >
                    <circle cx={x} cy={y} r="22" fill="transparent" />
                    {isActive && <circle className="map-pulse" cx={x} cy={y} r="14" fill="none" style={{ stroke: "rgb(var(--olive))" }} strokeWidth="2" opacity="0" />}
                    <rect
                      className="map-node"
                      x={x - size / 2}
                      y={y - size / 2}
                      width={size}
                      height={size}
                      style={{
                        fill: isActive ? "rgb(var(--olive))" : isLit ? "rgb(var(--ink))" : "rgb(var(--bone))",
                        stroke: isActive ? "rgb(var(--olive))" : "rgb(var(--ink))",
                        transition: "all .25s",
                      }}
                      strokeWidth="1.5"
                    />
                    <text
                      className="map-label"
                      x={x + dx}
                      y={y + dy}
                      textAnchor={anchor}
                      fontFamily="Inter Tight, sans-serif"
                      fontSize={isActive ? 18 : 17}
                      fontWeight={isActive ? 700 : isLit ? 600 : 400}
                      style={{ fill: isActive ? "rgb(var(--olive))" : "rgb(var(--ink))", ...HALO }}
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="map-intro absolute left-8 top-9 flex w-[540px] flex-col gap-3">
              <h1 className="text-[30px] font-medium leading-[1.2] tracking-[-0.01em]">
                I turn research about people, culture and information into interfaces, data visualisations and interactive prototypes.
              </h1>
              <p className="font-mono text-[12px] text-graphite">My practice as a map. Hover or select a skill to see its tools and the projects that use it.</p>
            </div>

            <div className="map-card absolute bottom-3 left-[1050px] flex w-[360px] flex-col gap-2 border border-ink bg-paper px-[18px] py-4 text-[14px] leading-normal shadow-[6px_6px_0_rgb(var(--olive))]" aria-live="polite">
              {activeNode ? (
                <>
                  <div className="flex justify-between font-mono text-[12px]">
                    <span className="text-olive">SKILL · {clusterOf(active).label.toUpperCase()}</span>
                    <span>
                      {neighbours(active).length} links · {activeWork.length} projects
                    </span>
                  </div>
                  <span className="text-[22px] font-bold leading-tight">{activeNode.label}</span>
                  <span>{SKILL_NOTES[active]}</span>
                  <span className="flex flex-wrap gap-x-3 font-semibold">
                    {activeWork.map((w) => (
                      <Link key={w.id} href={`/projects/${w.id}`} className="text-olive underline underline-offset-2 hover:text-ink">
                        {shortTitle(w.title)}
                      </Link>
                    ))}
                  </span>
                </>
              ) : (
                <span className="font-mono text-[12px] text-graphite">Select a skill to pin it here.</span>
              )}
            </div>

            <div className="map-legend absolute bottom-3 left-8 flex items-center gap-5 font-mono text-[12px] text-graphite">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" aria-hidden="true">
                  <rect x="1" y="1" width="10" height="10" fill="none" style={{ stroke: "rgb(var(--ink))" }} strokeWidth="1.5" />
                </svg>
                skill
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="none" style={{ stroke: "rgb(var(--olive))" }} strokeWidth="1.5" />
                </svg>
                tool
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="22" height="22" aria-hidden="true">
                  <SigilG cx={11} cy={11} r={10} skills={skillIds("0")} />
                </svg>
                project sigil: its spokes are the skills it uses
              </span>
              <span ref={readout} className="text-olive" aria-hidden="true">
                {`X ${String(ax).padStart(4, "0")} · Y ${String(ay).padStart(4, "0")}`}
              </span>
              <a href="#work" className="hover:text-ink">
                Scroll for all work ↓
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ——— phones: own layout, details in a bottom sheet ——— */}
      <div ref={narrowRef} className="px-4 pb-10 pt-8 map:hidden">
        <div className="map-intro flex flex-col gap-3">
          <p className="font-mono text-[12px] text-graphite">Creative technologist &amp; researcher · Amsterdam</p>
          <h1 className="text-[26px] font-medium leading-[1.2] tracking-[-0.01em]">
            I turn research about people, culture and information into interfaces, data visualisations and interactive prototypes.
          </h1>
          <p className="font-mono text-[12px] text-graphite">Tap a skill to see its tools and projects.</p>
        </div>
        <svg viewBox={`0 0 ${MAP_NARROW.W} ${MAP_NARROW.H + 20}`} className="mt-6 w-full" role="group" aria-label="Skills, linked where they feed into each other">
          <g aria-hidden="true">
            {EDGES.map(([a, b]) => {
              const hot = sheet && (a === sheet || b === sheet);
              return (
                <line
                  key={`${a}-${b}`}
                  className="map-edge"
                  x1={MAP_NARROW.pos[a][0]}
                  y1={MAP_NARROW.pos[a][1]}
                  x2={MAP_NARROW.pos[b][0]}
                  y2={MAP_NARROW.pos[b][1]}
                  style={{ stroke: hot ? "rgb(var(--olive))" : "rgb(var(--ink))" }}
                  strokeWidth={hot ? 2.5 : 1}
                  opacity={hot ? 1 : 0.4}
                />
              );
            })}
          </g>
          {NODES.map((n) => {
            const [x, y] = MAP_NARROW.pos[n.id];
            const on = sheet === n.id;
            return (
              <g key={n.id} {...nodeProps(skillLabel(n.id), () => setSheet(n.id))} aria-haspopup="dialog">
                <rect x={x - 16} y={y - 22} width={textWidth(n.label, 14) + 44} height="44" fill="transparent" />
                <rect className="map-node" x={x - 6} y={y - 6} width="12" height="12" style={{ fill: on ? "rgb(var(--olive))" : "rgb(var(--bone))", stroke: "rgb(var(--ink))" }} strokeWidth="1.5" />
                <text x={x + 13} y={y + 5} fontFamily="Inter Tight, sans-serif" fontSize="14" fontWeight={on ? 700 : 500} style={{ fill: "rgb(var(--ink))", ...HALO }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {sheet && (
        <>
          <button type="button" className="fixed inset-0 z-[60] bg-ink/50 map:hidden" aria-label="Close" onClick={() => setSheet(null)} />
          <div
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={labelOf(sheet)}
            className="fixed inset-x-0 bottom-0 z-[61] max-h-[75vh] overflow-y-auto border-t-4 border-olive bg-paper px-5 pb-8 pt-5 text-ink outline-none map:hidden"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[12px] text-olive">SKILL · {clusterOf(sheet).label.toUpperCase()}</p>
                <p className="mt-1 text-[24px] font-bold leading-tight">{labelOf(sheet)}</p>
              </div>
              <button type="button" onClick={() => setSheet(null)} className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center text-2xl" aria-label="Close">
                ×
              </button>
            </div>
            <p className="mt-3 text-[16px] leading-snug">{SKILL_NOTES[sheet]}</p>
            <p className="mt-4 font-mono text-[12px] text-graphite">{nodeOf(sheet).tools.join(" · ")}</p>
            <p className="mt-1 font-mono text-[12px] text-graphite">Linked to {neighbours(sheet).map(labelOf).join(" / ")}</p>
            {workOf(sheet).length > 0 && (
              <ul className="mt-4 flex flex-col border-t border-ink/20">
                {workOf(sheet).map((w) => (
                  <li key={w.id}>
                    <Link href={`/projects/${w.id}`} className="flex min-h-[48px] items-center justify-between border-b border-ink/20 text-[16px] font-medium">
                      {mapTitle(w)}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default SkillMap;
