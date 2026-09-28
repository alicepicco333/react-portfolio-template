import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePrefersReducedMotion } from "../../utils";
import { NODES, EDGES, neighbours, labelOf, nodeOf, project3d } from "../Graph/data";

// Square canvas; a smaller coordinate space on phones so labels stay readable.
const GEOMETRY = {
  wide: { W: 700, H: 700, sx: 250, sy: 215, font: 13, dy: -30, hit: 18 },
  narrow: { W: 520, H: 520, sx: 180, sy: 150, font: 14, dy: -20, hit: 32 },
};
const REST = { ay: -0.35, ax: 0.18 };
const shortTitle = (title) => {
  const t = title.split(" - ")[0];
  return t.length > 24 ? `${t.slice(0, 22)}…` : t;
};
const easeOut = (t) => 1 - (1 - t) ** 3;

// Place n items on an arc around (x, y), pointing away from the canvas centre.
function fan(x, y, n, radius, g, spread = 1.5) {
  const out = Math.atan2(y - g.H / 2, x - g.W / 2);
  return Array.from({ length: n }, (_, i) => {
    const a = n === 1 ? out : out - spread / 2 + (spread * i) / (n - 1);
    return { x: x + Math.cos(a) * radius, y: y + Math.sin(a) * radius, a };
  });
}

const PracticeMap = ({ projects = [], progress = null, initialSkill = null, fill = false }) => {
  const reducedMotion = usePrefersReducedMotion();
  const router = useRouter();
  const [angle, setAngle] = useState(REST);
  const [intro, setIntro] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [narrow, setNarrow] = useState(false);
  const tilt = useRef({ ay: 0, ax: 0 });
  const spin = useRef(REST.ay);
  const sheetRef = useRef(null);
  const active = narrow ? pinned : hovered || pinned;
  const activeRef = useRef(null);
  activeRef.current = active;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // open on a skill passed in from a link (e.g. from a project page)
  useEffect(() => {
    if (initialSkill) setPinned(initialSkill);
  }, [initialSkill]);

  // unfold from the centre on load (unless the scroll position drives it)
  useEffect(() => {
    if (reducedMotion || progress !== null) {
      setIntro(1);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 1400);
      setIntro(easeOut(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, progress !== null]);

  // slow turn and pointer tilt on larger screens; phones get a still, flat map
  useEffect(() => {
    if (reducedMotion || narrow) {
      setAngle(REST);
      return undefined;
    }
    let frame;
    const tick = () => {
      if (!activeRef.current) spin.current += 0.0022;
      setAngle((prev) => ({
        ay: prev.ay + (spin.current + tilt.current.ay - prev.ay) * 0.08,
        ax: prev.ax + (REST.ax + tilt.current.ax - prev.ax) * 0.08,
      }));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, narrow]);

  // bottom sheet: focus on open, Escape closes
  useEffect(() => {
    if (!narrow || !pinned) return undefined;
    sheetRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setPinned(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [narrow, pinned]);

  const onPointerMove = (event) => {
    if (narrow) return;
    const rect = event.currentTarget.getBoundingClientRect();
    tilt.current = {
      ay: ((event.clientX - rect.left) / rect.width - 0.5) * 0.9,
      ax: ((event.clientY - rect.top) / rect.height - 0.5) * -0.6,
    };
  };

  const togglePin = (id) => setPinned((current) => (current === id ? null : id));

  const g = narrow ? GEOMETRY.narrow : GEOMETRY.wide;
  const open = progress !== null ? easeOut(Math.max(0, Math.min(1, progress))) : intro;
  const points = Object.fromEntries(
    NODES.map((n) => [n.id, project3d(n.p.map((v) => v * (0.15 + 0.85 * open)), angle.ay, angle.ax, g)])
  );
  const lit = active ? new Set([active, ...neighbours(active)]) : null;
  const depthOpacity = (z) => 0.35 + (1 - (z + 1.2) / 2.4) * 0.65; // nearer = brighter
  const sorted = [...NODES].sort((a, b) => points[b.id].z - points[a.id].z); // paint far → near
  const activeNode = active ? nodeOf(active) : null;
  const activeWork = activeNode
    ? activeNode.work.map((id) => projects.find((p) => p.id === id)).filter(Boolean)
    : [];

  // subnodes around the active skill (desktop): tools on an inner arc, projects on an outer one
  const sub = activeNode && !narrow ? points[activeNode.id] : null;
  const toolPts = sub ? fan(sub.x, sub.y, activeNode.tools.length, 74, g, 1.3) : [];
  const workPts = sub ? fan(sub.x, sub.y, activeWork.length, 138, g, 1.7) : [];
  const clampX = (x) => Math.max(14, Math.min(g.W - 14, x));
  const clampY = (y) => Math.max(14, Math.min(g.H - 120, y));

  return (
    <div
      className="relative h-full overflow-hidden bg-olive text-bone"
      onPointerMove={onPointerMove}
      onPointerLeave={() => (tilt.current = { ay: 0, ax: 0 })}
    >
      <svg
        viewBox={`0 0 ${g.W} ${g.H}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio={fill ? (narrow ? "xMidYMax meet" : "xMaxYMid meet") : "xMidYMid meet"}
        role="group"
        aria-label="Practice map: connected skills; select one to see its tools and the projects that use it"
      >
        <g strokeLinecap="round">
          {EDGES.map(([a, b]) => {
            const pa = points[a];
            const pb = points[b];
            const on = lit && (a === active || b === active);
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                style={{ stroke: on ? "rgb(var(--signal))" : "rgb(var(--bone))" }}
                strokeWidth={on ? 1.6 : 1}
                strokeOpacity={(lit ? (on ? 1 : 0.08) : depthOpacity((pa.z + pb.z) / 2) * 0.55) * open}
              />
            );
          })}
        </g>

        {sub && (
          <g aria-hidden="true">
            {toolPts.map((pt, i) => (
              <g key={`t-${activeNode.tools[i]}`}>
                <line x1={sub.x} y1={sub.y} x2={clampX(pt.x)} y2={clampY(pt.y)} style={{ stroke: "rgb(var(--signal))" }} strokeOpacity="0.6" strokeDasharray="2 3" />
                <circle cx={clampX(pt.x)} cy={clampY(pt.y)} r="3" style={{ fill: "rgb(var(--signal))" }} />
                <text
                  x={clampX(pt.x) + (Math.cos(pt.a) >= 0 ? 7 : -7)}
                  y={clampY(pt.y) + 4}
                  textAnchor={Math.cos(pt.a) >= 0 ? "start" : "end"}
                  fontFamily="Instrument Sans, sans-serif"
                  fontSize="11.5"
                  style={{ fill: "rgb(var(--bone))" }}
                >
                  {activeNode.tools[i]}
                </text>
              </g>
            ))}
            {workPts.map((pt, i) => {
              const w = activeWork[i];
              const x = clampX(pt.x);
              const y = clampY(pt.y);
              return (
                <g
                  key={`w-${w.id}`}
                  style={{ cursor: "pointer", pointerEvents: "auto" }}
                  onClick={() => router.push(`/projects/${w.id}`)}
                >
                  <line x1={sub.x} y1={sub.y} x2={x} y2={y} style={{ stroke: "rgb(var(--bone))" }} strokeOpacity="0.35" />
                  <rect x={x - 5} y={y - 5} width="10" height="10" style={{ fill: w.accent || "rgb(var(--bone))", stroke: "rgb(var(--bone))" }} strokeWidth="1.2" />
                  <text
                    x={x + (Math.cos(pt.a) >= 0 ? 9 : -9)}
                    y={y + 4}
                    textAnchor={Math.cos(pt.a) >= 0 ? "start" : "end"}
                    fontFamily="Instrument Sans, sans-serif"
                    fontSize="11.5"
                    fontWeight="600"
                    style={{ fill: "rgb(var(--bone))" }}
                  >
                    {shortTitle(w.title)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {sorted.map((node) => {
          const pt = points[node.id];
          const isActive = active === node.id;
          const isLit = !lit || lit.has(node.id);
          const right = pt.x < g.W / 2 + g.W * 0.14; // label side, so text stays inside the frame
          const opacity = (isLit ? (lit ? 1 : depthOpacity(pt.z)) : 0.15) * open;
          return (
            <g
              key={node.id}
              tabIndex={0}
              role="button"
              aria-label={`${node.label}: tools ${node.tools.join(", ")}; connected to ${neighbours(node.id).map(labelOf).join(", ")}`}
              aria-pressed={pinned === node.id}
              aria-haspopup={narrow ? "dialog" : undefined}
              onMouseEnter={() => !narrow && setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => !narrow && setHovered(node.id)}
              onBlur={() => setHovered(null)}
              onClick={() => togglePin(node.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  togglePin(node.id);
                }
              }}
              style={{ cursor: "pointer", outline: "none", opacity, transition: "opacity .3s" }}
            >
              <circle cx={pt.x} cy={pt.y} r={g.hit} fill="transparent" />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={(isActive ? 7 : 4.5) * pt.scale * (narrow ? 1.25 : 1)}
                style={{
                  fill: isActive ? "rgb(var(--signal))" : lit && isLit ? "rgb(var(--pink))" : "rgb(var(--bone))",
                  stroke: "rgb(var(--ink))",
                }}
                strokeWidth="1"
              />
              <text
                x={pt.x + (right ? 12 : -12)}
                y={pt.y + 4}
                textAnchor={right ? "start" : "end"}
                fontFamily="Instrument Sans, sans-serif"
                fontSize={g.font + 3 * (pt.scale - 0.7)}
                fontWeight={isActive ? 600 : 500}
                style={{ fill: isActive ? "rgb(var(--signal))" : "rgb(var(--bone))" }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* desktop: where the selected skill shows up */}
      {!narrow && (
        <div className={`pointer-events-none absolute bottom-5 ${fill ? "left-4 max-w-[620px] tablet:left-10" : "inset-x-6"}`} aria-live="polite">
          {activeNode ? (
            <div className="pointer-events-auto bg-bone px-4 py-3 text-ink">
              <p className="flex flex-wrap items-baseline gap-x-3 text-[15px]">
                <span className="font-semibold">{activeNode.label}</span>
                <span className="fu-meta text-graphite">{activeNode.tools.join(" · ")}</span>
              </p>
              {activeWork.length > 0 && (
                <ul className="mt-1 flex flex-wrap gap-x-4 text-[14px] font-medium">
                  {activeWork.map((work) => (
                    <li key={work.id}>
                      <Link href={`/projects/${work.id}`} className="underline decoration-olive underline-offset-2 hover:decoration-2">
                        {work.title.split(" - ")[0]} ↗
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="fu-meta text-bone/70">Hover or click a skill to unfold its tools and projects</p>
          )}
        </div>
      )}

      {narrow && !activeNode && (
        <p className="fu-meta pointer-events-none absolute inset-x-4 bottom-4 text-bone/70">Tap a skill to see its tools and projects</p>
      )}

      {/* phones: bottom sheet */}
      {narrow && activeNode && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-ink/50"
            aria-label="Close"
            onClick={() => setPinned(null)}
          />
          <div
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={activeNode.label}
            className="fixed inset-x-0 bottom-0 z-[61] max-h-[75vh] overflow-y-auto border-t-4 border-olive bg-bone px-5 pb-8 pt-5 text-ink outline-none"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="fu-title text-phi1">{activeNode.label}</p>
              <button
                type="button"
                onClick={() => setPinned(null)}
                className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="fu-meta mt-1 text-graphite">Linked to {neighbours(activeNode.id).map(labelOf).join(" / ")}</p>
            <p className="fu-meta mt-5 text-olive">Tools &amp; methods</p>
            <p className="mt-1 text-[16px]">{activeNode.tools.join(" · ")}</p>
            {activeWork.length > 0 && (
              <>
                <p className="fu-meta mt-5 text-olive">Where it shows up</p>
                <ul className="mt-1 flex flex-col border-t border-ink/20">
                  {activeWork.map((work) => (
                    <li key={work.id}>
                      <Link
                        href={`/projects/${work.id}`}
                        className="flex min-h-[48px] items-center justify-between border-b border-ink/20 text-[16px] font-medium"
                      >
                        {work.title.split(" - ")[0]}
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PracticeMap;
