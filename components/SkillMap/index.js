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
  CLUSTERS,
  clusterOf,
  SKILL_NOTES,
  MAP,
} from "../Graph/data";
import { useIsomorphicLayoutEffect } from "../../utils";
import { textWidth, overlapArea } from "../../utils/layout";
import { scramble, drawIn, motionOn } from "../../utils/motion";

const shortTitle = (title) => title.split(" - ")[0];
const mapTitle = (p) => p.short || shortTitle(p.title);
const HALO = { paintOrder: "stroke", stroke: "rgb(var(--bone))", strokeWidth: 6, strokeLinejoin: "round" };

// ——— desktop geometry ———
function labelBox(id) {
  const [x, y] = MAP.pos[id];
  const [dx, dy, anchor] = MAP.label[id];
  const w = textWidth(labelOf(id), 18) * 1.1;
  const left = anchor === "end" ? x + dx - w : x + dx;
  return [left - 10, y + dy - 18, left + w + 10, y + dy + 7];
}
const nodeBox = (id) => [MAP.pos[id][0] - 15, MAP.pos[id][1] - 15, MAP.pos[id][0] + 15, MAP.pos[id][1] + 15];
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

// Projects fan out from the selected skill: try every direction, radius and spread and keep
// the one that covers nothing.
function fanLayout(id, works) {
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
          const w = textWidth(`${mapTitle(p)} ↗`, 17) * 1.12 + 6;
          return { p, x, y, right, box: grow(right ? [x - 19, y - 20, x + 26 + w, y + 20] : [x - 26 - w, y - 20, x + 19, y + 20], 6) };
        });
        const score = cost(pts.map((o) => o.box), STATIC_BOXES);
        if (!leaves || score < leaves.score) leaves = { score, pts };
      });
    });
  }
  return { leafPts: leaves.pts };
}

const SkillMap = ({ projects }) => {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState("ixd");
  const [chipW, setChipW] = useState({});
  const labelRefs = useRef({});
  const [fit, setFit] = useState(null);
  const [frameH, setFrameH] = useState(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const narrowRef = useRef(null);
  const active = hovered || pinned;

  // `?skill=<id>` opens the map on that skill
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("skill");
    if (id && nodeOf(id)) setPinned(id);
  }, []);

  // scale the 1440 × 920 stage to the first screen, but never below 80% so labels stay readable;
  // on short screens the map then runs a little taller than the window
  useEffect(() => {
    const measure = () => {
      const el = frameRef.current;
      if (!el) return;
      const room = Math.max(480, window.innerHeight - 64);
      const f = Math.min(el.clientWidth / MAP.W, Math.max(0.8, room / MAP.H));
      setFit(f);
      setFrameH(Math.max(room, MAP.H * f));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // size each skill chip to its label once the fonts are in
  useEffect(() => {
    if (!fit) return;
    const measure = () => {
      const w = {};
      NODES.forEach((n) => {
        const el = labelRefs.current[n.id];
        if (el) w[n.id] = el.getComputedTextLength();
      });
      setChipW(w);
    };
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    else measure();
  }, [fit]);

  const workOf = (id) => nodeOf(id).work.map((pid) => projects.find((p) => p.id === pid)).filter(Boolean);
  const activeNode = active ? nodeOf(active) : null;
  const activeWork = activeNode ? workOf(active) : [];
  const fan = useMemo(() => (activeNode ? fanLayout(active, activeWork) : null), [active]); // eslint-disable-line react-hooks/exhaustive-deps
  const lit = activeNode ? new Set(neighbours(active)) : new Set();

  // ——— motion ———
  useIsomorphicLayoutEffect(() => {
    if (!fit) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!motionOn()) return;
      const s = stageRef.current;
      if (s && s.offsetParent !== null) {
        const q = (sel) => Array.from(s.querySelectorAll(sel));
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(q(".map-intro > *"), { y: 26, opacity: 0, duration: 0.9, stagger: 0.1 }, 0);
        drawIn(gsap, q(".map-edge"), { at: 0.25, step: 0.035, duration: 0.7 });
        tl.from(q(".map-node"), { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.035, ease: "back.out(2.2)" }, 0.35);
        tl.from(q(".map-chip-g"), { opacity: 0, y: 6, duration: 0.5, stagger: 0.025 }, 0.7);
        q(".map-cluster").forEach((el, i) => scramble(gsap, el, 0.9 + i * 0.18));
        tl.from(q(".map-card"), { x: 60, opacity: 0, duration: 0.8 }, 1.4);
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

  // new skill: fan its projects out, and let the node glow
  useIsomorphicLayoutEffect(() => {
    if (!fit || !active) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!motionOn()) return;
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
      gsap.fromTo(
        s.querySelectorAll(".map-glow"),
        { scale: 0.75, opacity: 0.55, transformOrigin: "50% 50%" },
        { scale: 1.12, opacity: 1, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
    });
    return () => mm.revert();
  }, [active, fit]);

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
    style: { cursor: "pointer" },
    className: "map-focus",
  });
  const goTo = (id) => router.push(`/projects/${id}`);
  const [ax, ay] = active ? MAP.pos[active] : [0, 0];

  return (
    <section id="map" aria-labelledby="map-title" className="relative scroll-mt-16 bg-bone">
      <h2 id="map-title" className="sr-only">Skill map</h2>
      {/* ——— desktop and tablet: the fixed stage ——— */}
      <div ref={frameRef} className="relative hidden h-[calc(100svh-64px)] w-full map:block" style={frameH ? { height: frameH } : undefined}>
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: MAP.W * (fit || 1), height: MAP.H * (fit || 1), transform: "translate(-50%, -50%)", visibility: fit ? "visible" : "hidden" }}
        >
          <div ref={stageRef} className="absolute left-0 top-0 origin-top-left" style={{ width: MAP.W, height: MAP.H, transform: `scale(${fit || 1})` }}>
            <svg viewBox={`0 0 ${MAP.W} ${MAP.H}`} className="absolute inset-0 h-full w-full" role="group" aria-label="Skills, linked where they feed into each other. Select one to see its tools and projects.">
              <defs>
                <radialGradient id="map-glow-fill">
                  <stop offset="0%" stopColor="rgb(37, 82, 133)" stopOpacity="0.55" />
                  <stop offset="45%" stopColor="rgb(37, 82, 133)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="rgb(37, 82, 133)" stopOpacity="0" />
                </radialGradient>
                <filter id="map-glow-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
              </defs>
              <g aria-hidden="true">
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
                    opacity={1}
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
                      opacity={hot ? 1 : active ? 0.22 : 0.4}
                    />
                  );
                })}
              </g>

              {fan && (
                <g key={active}>
                  {fan.leafPts.map(({ p, x, y, right }) => (
                    <g key={`w-${p.id}`} className="fan-item" data-x={x} data-y={y} {...nodeProps(`Open ${mapTitle(p)}`, () => goTo(p.id))} role="link">
                      <line className="fan-line" x1={ax} y1={ay} x2={x} y2={y} style={{ stroke: "rgb(var(--olive))" }} strokeWidth="1.5" />
                      <circle cx={x} cy={y} r="6" style={{ fill: "rgb(var(--olive))" }} />
                      <text
                        x={right ? x + 14 : x - 14}
                        y={y + 5}
                        textAnchor={right ? "start" : "end"}
                        fontFamily="Inter Tight, sans-serif"
                        fontSize="17"
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
                    {isActive && <circle className="map-glow" cx={x} cy={y} r="78" fill="url(#map-glow-fill)" filter="url(#map-glow-blur)" />}
                    <circle
                      className="map-node"
                      cx={x}
                      cy={y}
                      r={isActive ? 13 : 6.5}
                      style={{
                        fill: isActive ? "rgb(var(--olive))" : isLit ? "rgb(var(--ink))" : "rgb(var(--bone))",
                        stroke: isActive ? "rgb(var(--olive))" : "rgb(var(--ink))",
                        transition: "all .25s",
                      }}
                      strokeWidth="1.5"
                    />
                    <g className="map-chip-g">
                      {(() => {
                        const tw = (chipW[n.id] || textWidth(n.label, 18)) * (isActive || isLit ? 1.05 : 1);
                        const left = anchor === "end" ? x + dx - tw : x + dx;
                        return (
                          <rect
                            className="map-chip"
                            x={left - 10}
                            y={y + dy - 18}
                            width={tw + 20}
                            height="25"
                            style={{ fill: isActive ? "rgb(var(--olive))" : "rgb(var(--paper))", stroke: isActive ? "rgb(var(--olive))" : isLit ? "rgb(var(--ink))" : "rgb(var(--concrete))", transition: "fill .25s, stroke .25s" }}
                            strokeWidth={isLit ? 1.5 : 1}
                          />
                        );
                      })()}
                      <text
                        ref={(el) => {
                          labelRefs.current[n.id] = el;
                        }}
                        className="map-label"
                        x={x + dx}
                        y={y + dy}
                        textAnchor={anchor}
                        fontFamily="Inter Tight, sans-serif"
                        fontSize="18"
                        fontWeight={isActive ? 700 : isLit ? 600 : 400}
                        style={{ fill: isActive ? "#fff" : "rgb(var(--ink))" }}
                      >
                        {n.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            <div className="map-intro absolute left-8 top-9 flex w-[640px] flex-col gap-3">
              <p className="text-[34px] font-medium leading-[1.16] tracking-[-0.015em]">
                I&rsquo;m an HCI researcher and designer. I combine user research, accessibility and front-end prototyping to build clear, inclusive interfaces and data systems.
              </p>
            </div>

            <div className="map-card absolute bottom-3 left-[1020px] flex w-[390px] flex-col gap-2 border border-ink bg-paper px-5 py-4 text-[16px] leading-snug shadow-[6px_6px_0_rgb(var(--olive))]" aria-live="polite">
              {activeNode ? (
                <>
                  <span className="text-[26px] font-bold leading-tight">{activeNode.label}</span>
                  <span>{SKILL_NOTES[active]}</span>
                  <span className="font-mono text-[14px] text-graphite">{activeNode.tools.join(" · ")}</span>
                  <span className="flex flex-wrap gap-x-3 font-semibold">
                    {activeWork.map((w) => (
                      <Link key={w.id} href={`/projects/${w.id}`} className="text-olive underline underline-offset-2 hover:text-ink">
                        {mapTitle(w)}
                      </Link>
                    ))}
                  </span>
                </>
              ) : (
                <span className="font-mono text-[14px] text-graphite">Select a skill to pin it here.</span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ——— phones and tablets: the statement only; the map needs a wide screen ——— */}
      <div ref={narrowRef} className="relative overflow-hidden px-4 pb-16 pt-14 tablet:px-8 tablet:pb-24 tablet:pt-20 map:hidden">
        <div className="hero-glow pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full tablet:h-[520px] tablet:w-[520px]" aria-hidden="true" />
        <div className="map-intro relative flex max-w-[720px] flex-col gap-6">
          <p className="text-[34px] font-medium leading-[1.12] tracking-[-0.02em] tablet:text-[52px]">
            I&rsquo;m an HCI researcher and designer. I combine user research, accessibility and front-end prototyping to build clear, inclusive interfaces and data systems.
          </p>
          <a href="#work" className="w-max border-b-2 border-olive pb-1 font-mono text-[14px] text-olive">
            see the work ↓
          </a>
        </div>
      </div>
    </section>
  );
};

export default SkillMap;
