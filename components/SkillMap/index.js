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
import { useIsomorphicLayoutEffect, withBase } from "../../utils";
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

// a plain key press inside this section, not typing in a field and not a browser shortcut
const plainKey = (e) => !(e.metaKey || e.ctrlKey || e.altKey) && !/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName);
// the statement's phrases, each opening the part of the map it names
const PHRASES = [
  ["complex information", "dv"],
  ["easy to understand and trust", "ux"],
  ["test it with the people who use it", "ur"],
];
// 1 to 5 select the first skill of each step of the method: listen, order, count, shape, play
const STEP_KEYS = ["listening", "ordering", "counting", "shaping", "playing"];

const SkillMap = ({ projects }) => {
  const router = useRouter();
  // the map rests quietly: the whole network in grey with plain labels; a hovered, focused or picked skill
  // lights its own lines and neighbours and opens its card
  const quiet = true;
  // the statement as a headline above the graph; `?hero=now` / `?hero=caption` show the earlier placements
  const [heroMode, setHeroMode] = useState("band");
  const bandRef = useRef(null);
  const TOP = heroMode === "band" ? 70 : 0; // band: the empty strip above the graph is cropped
  const SH = MAP.H - TOP;
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("hero");
    if (m === "now" || m === "caption") setHeroMode(m);
  }, []);
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [chipW, setChipW] = useState({});
  const labelRefs = useRef({});
  const [fit, setFit] = useState(null);
  const [frameH, setFrameH] = useState(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const narrowRef = useRef(null);
  const active = pinned;

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
      const room = Math.max(480, window.innerHeight - 64 - (bandRef.current?.offsetHeight || 0));
      const h = MAP.H - (heroMode === "band" ? 70 : 0);
      const f = Math.min(el.clientWidth / MAP.W, Math.max(heroMode === "band" ? 0.7 : 0.8, room / h));
      setFit(f);
      setFrameH(Math.max(room, h * f));
    };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [heroMode]);

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
        tl.from(q(".map-intro > *"), { y: 26, duration: 0.9, stagger: 0.1 }, 0);
        drawIn(gsap, q(".map-edge"), { at: 0.25, step: 0.035, duration: 0.7 });
        tl.from(q(".map-node"), { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.035, ease: "back.out(2.2)" }, 0.35);
        tl.from(q(".map-chip-g"), { opacity: 0, y: 6, duration: 0.5, stagger: 0.025 }, 0.7);
        q(".map-cluster").forEach((el, i) => scramble(gsap, el, 0.9 + i * 0.18));
      }
      const n = narrowRef.current;
      if (n && n.offsetParent !== null) {
        const q = (sel) => Array.from(n.querySelectorAll(sel));
        gsap.from(q(".map-intro > *"), { y: 20, duration: 0.8, stagger: 0.1, ease: "power3.out" });
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
    });
    return () => mm.revert();
  }, [active, fit]);

  const toggle = (id) => setPinned((current) => (current === id ? null : id));
  const statement = (
    <>
                  <>
                    I&rsquo;m an HCI researcher and designer. I make{" "}
                    {PHRASES.map(([text, id], i) => (
                      <React.Fragment key={id}>
                        {i === 1 && " "}
                        {i === 2 && ", and I "}
                        {/* a span, not a <button>: buttons cannot wrap mid-phrase, and the sentence must read as one */}
                        <span
                          role="button"
                          tabIndex={0}
                          aria-pressed={active === id}
                          aria-label={`${text}: show ${labelOf(id)} in the map`}
                          onMouseEnter={() => setPinned(id)}
                          onFocus={() => setPinned(id)}
                          onClick={() => setPinned(id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setPinned(id);
                            }
                          }}
                          className={`cursor-pointer underline decoration-2 underline-offset-[6px] transition-[text-decoration-color,color] duration-150 hover:text-olive ${active === id ? "text-olive decoration-olive" : "decoration-ink/25"}`}
                        >
                          {text}
                        </span>
                      </React.Fragment>
                    ))}
                    .
                  </>
</>
  );
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
    <section
      id="map"
      aria-labelledby="map-title"
      className="relative scroll-mt-16 bg-bone"
      onKeyDown={(e) => {
        const i = "12345".indexOf(e.key);
        if (i < 0 || !plainKey(e)) return;
        const c = CLUSTERS.find((x) => x.id === STEP_KEYS[i]);
        if (c) setPinned(c.skills[0]);
      }}
    >
      <h2 id="map-title" className="sr-only">Skill map</h2>
      {heroMode === "band" && (
        <div ref={bandRef} className="map-intro hidden px-8 pt-8 map:block">
          <p className="fu-display max-w-[1320px] text-phi2 leading-[1.08]">{statement}</p>
        </div>
      )}
      {/* ——— desktop and tablet: the fixed stage ——— */}
      <div ref={frameRef} className="relative hidden h-[calc(100svh-64px)] w-full map:block" style={frameH ? { height: frameH } : undefined}>
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: MAP.W * (fit || 1), height: SH * (fit || 1), transform: "translate(-50%, -50%)", visibility: fit ? "visible" : "hidden" }}
        >
          <div
            ref={stageRef}
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: MAP.W, height: SH, transform: `scale(${fit || 1})` }}
            onMouseLeave={() => setPinned(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setPinned(null);
            }}
          >
            <svg viewBox={`0 ${TOP} ${MAP.W} ${SH}`} className="absolute inset-0 h-full w-full" role="group" aria-label="Skills, linked where they feed into each other. Select one to see its tools and projects.">
              <defs>
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
                      {!quiet && <text
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
                      </text>}
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
                    onMouseEnter={() => {
                      setHovered(n.id);
                      setPinned(n.id);
                    }}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => {
                      setHovered(n.id);
                      setPinned(n.id);
                    }}
                    onBlur={() => setHovered(null)}
                  >
                    <circle cx={x} cy={y} r="22" fill="transparent" />
                    {/* the selected skill: a crisp ink ring around the node, no glow */}
                    {isActive && <circle className="map-ring" cx={x} cy={y} r="21" fill="none" style={{ stroke: "rgb(var(--ink))" }} strokeWidth="1.5" />}
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
                      {/* quiet: only the selected skill and its neighbours wear a chip; the rest read as plain grey labels */}
                      {!(quiet && !isActive && !isLit && hovered !== n.id) && (() => {
                        const tw = (chipW[n.id] || textWidth(n.label, 18)) * (isActive || isLit ? 1.05 : 1);
                        const left = anchor === "end" ? x + dx - tw : x + dx;
                        return (
                          <rect
                            className="map-chip"
                            x={left - 10}
                            y={y + dy - 18}
                            width={tw + 20}
                            height="25"
                            style={{ fill: isActive ? "rgb(var(--olive))" : hovered === n.id ? "color-mix(in srgb, rgb(var(--olive)) 16%, #fff)" : "rgb(var(--paper))", stroke: isActive || hovered === n.id ? "rgb(var(--olive))" : isLit ? "rgb(var(--ink))" : "rgb(var(--concrete))", transition: "fill .2s, stroke .2s" }}
                            strokeWidth={hovered === n.id && !isActive ? 2.5 : isLit ? 1.5 : 1}
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
                        style={{
                          fill: isActive ? "#fff" : hovered === n.id ? "rgb(var(--olive))" : quiet && !isLit ? "rgb(var(--graphite))" : "rgb(var(--ink))",
                          transition: "fill .2s",
                          // a plain label (no chip) keeps the lines off its letters with a halo in the page colour
                          ...(quiet && !isActive && !isLit && hovered !== n.id ? HALO : {}),
                        }}
                      >
                        {n.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {heroMode !== "band" && (
              <div className={`map-intro absolute left-8 top-9 flex flex-col gap-3 ${heroMode === "caption" ? "w-[470px]" : "w-[640px]"}`}>
                <p className={heroMode === "caption" ? "text-phi1 font-medium leading-[1.25] tracking-[-0.01em]" : "text-[34px] font-medium leading-[1.16] tracking-[-0.015em]"}>{statement}</p>
              </div>
            )}

            {/* always in the page (it is the live region), shown only while a skill is selected */}
            <div className={`map-card absolute bottom-3 ${activeNode && MAP.pos[active][0] > 720 ? "left-[30px]" : "left-[1020px]"} flex w-[390px] flex-col gap-2 border border-ink bg-paper px-5 py-4 text-[16px] leading-snug shadow-[6px_6px_0_rgb(var(--olive))] ${activeNode ? "" : "invisible"}`} aria-live="polite">
              {activeNode && (

                <>
                  <span className="text-[26px] font-bold leading-tight">{activeNode.label}</span>
                  <span>{SKILL_NOTES[active]}</span>
                  <span className="font-mono text-[14px] text-graphite">{activeNode.tools.join(", ")}</span>
                  <span className="mt-1 grid grid-cols-3 gap-2">
                    {activeWork.slice(0, 3).map((w) => (
                      <Link key={w.id} href={`/projects/${w.id}`} className="group flex flex-col gap-1 text-[13px] font-semibold leading-tight text-olive">
                        {(w.cardWebp || w.cardImage) && (
                          <img src={withBase(w.cardWebp || w.cardImage)} alt="" className="aspect-[4/3] w-full border border-ink object-cover transition-transform duration-200 group-hover:-translate-y-0.5" loading="lazy" draggable={false} />
                        )}
                        <span className="underline underline-offset-2 group-hover:text-ink">{mapTitle(w)}</span>
                      </Link>
                    ))}
                  </span>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ——— phones and tablets: the statement only; the map needs a wide screen ——— */}
      <div ref={narrowRef} className="relative overflow-hidden px-4 pb-16 pt-14 tablet:px-8 tablet:pb-24 tablet:pt-20 map:hidden">
        <div className="map-intro relative flex max-w-[720px] flex-col gap-6">
          <p className="text-[34px] font-medium leading-[1.12] tracking-[-0.02em] tablet:text-[52px]">
            I&rsquo;m an HCI researcher and designer. I make complex information easy to understand and trust, and I test it with the people who use it.
          </p>
          {/* the work, straight away: the three projects that lead Selected work */}
          <ul className="grid grid-cols-3 gap-3">
            {[...projects].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).slice(0, 3).map((w) => (
              <li key={w.id}>
                <Link href={`/projects/${w.id}`} className="flex flex-col gap-1.5 text-[14px] font-semibold leading-tight">
                  <img src={withBase(w.cardWebp || w.cardImage)} alt="" className="aspect-[4/3] w-full border border-ink object-cover" loading="eager" draggable={false} />
                  <span>{mapTitle(w)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <a href="#work" className="w-max border-b-2 border-olive pb-1 font-mono text-[14px] text-olive">
            All work
          </a>
        </div>
      </div>
    </section>
  );
};

export default SkillMap;
