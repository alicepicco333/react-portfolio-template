import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrefersReducedMotion } from "../../utils";

// A constellation of skills with no parent nodes: each skill links to the ones it
// actually feeds into. Positions are hand-placed in 3D (x, y, z in -1…1) so the
// shape stays asymmetric; the whole thing turns slowly and tilts with the pointer.
// `work` lists the projects (by id) where each skill shows up.
const NODES = [
  { id: "anth", label: "Anthropology", p: [-0.9, -0.7, 0.3], work: ["0"] },
  { id: "ur", label: "User research", p: [-0.2, -0.85, 0.55], work: ["0", "11", "20"] },
  { id: "cult", label: "Cultural analytics", p: [-0.75, 0.05, -0.1], work: ["3", "12"] },
  { id: "dh", label: "Digital humanities", p: [-0.45, -0.35, -0.6], work: ["1", "13", "0"] },
  { id: "arch", label: "Digital archives", p: [-0.95, 0.55, -0.5], work: ["13", "0"] },
  { id: "sem", label: "Semantic web", p: [-0.3, 0.25, -0.95], work: ["12", "2"] },
  { id: "onto", label: "Ontologies", p: [-0.55, 0.8, -0.75], work: ["2", "12"] },
  { id: "hci", label: "HCI", p: [0.15, -0.55, 0.35], work: ["0", "1", "20"] },
  { id: "ux", label: "UX design", p: [0.55, -0.8, 0.15], work: ["0", "11", "20"] },
  { id: "ixd", label: "Interaction design", p: [0.35, -0.05, 0.75], work: ["0", "11", "3", "20"] },
  { id: "dv", label: "Data visualization", p: [0.05, 0.2, -0.35], work: ["3", "12"] },
  { id: "vis", label: "Visual design", p: [0.85, -0.35, -0.25], work: ["11", "0"] },
  { id: "3d", label: "3D & animation", p: [0.95, 0.25, 0.35], work: ["6", "9"] },
  { id: "ar", label: "AR filters", p: [0.6, 0.55, 0.8], work: [] },
  { id: "cc", label: "Creative coding", p: [0.25, 0.6, 0.2], work: ["5", "10", "14"] },
  { id: "live", label: "Live coding", p: [0.45, 0.95, -0.3], work: ["5", "10", "14"] },
  { id: "perf", label: "Performance", p: [0.9, 0.85, -0.6], work: ["5", "14"] },
];

const EDGES = [
  ["anth", "ur"], ["anth", "cult"], ["anth", "dh"],
  ["dh", "arch"], ["dh", "sem"], ["dh", "dv"], ["sem", "onto"], ["onto", "arch"],
  ["cult", "dv"], ["ur", "hci"], ["hci", "ux"], ["hci", "ixd"], ["ux", "vis"],
  ["dv", "vis"], ["dv", "cc"], ["ixd", "cc"], ["ixd", "ar"], ["ar", "3d"],
  ["vis", "3d"], ["cc", "live"], ["live", "perf"], ["3d", "perf"],
];

const neighbours = (id) =>
  EDGES.filter((e) => e.includes(id)).map((e) => (e[0] === id ? e[1] : e[0]));
const labelOf = (id) => NODES.find((n) => n.id === id).label;

// Square canvas; a smaller coordinate space on phones so labels stay readable.
const GEOMETRY = {
  wide: { W: 700, H: 700, sx: 250, sy: 215, font: 13, dy: -30 },
  narrow: { W: 520, H: 520, sx: 180, sy: 150, font: 14, dy: -30 },
};

function project([x, y, z], ay, ax, g) {
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const y1 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  const scale = 2.8 / (2.8 + z2); // perspective
  return { x: g.W / 2 + x1 * scale * g.sx, y: g.H / 2 + g.dy + y1 * scale * g.sy, z: z2, scale };
}

const PracticeMap = ({ projects = [] }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [angle, setAngle] = useState({ ay: -0.35, ax: 0.18 });
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [narrow, setNarrow] = useState(false);
  const tilt = useRef({ ay: 0, ax: 0 });
  const spin = useRef(-0.35);
  const active = hovered || pinned;
  const activeRef = useRef(null);
  activeRef.current = active;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    let frame;
    const tick = () => {
      if (!activeRef.current) spin.current += 0.0022;
      setAngle((prev) => ({
        ay: prev.ay + (spin.current + tilt.current.ay - prev.ay) * 0.08,
        ax: prev.ax + (0.18 + tilt.current.ax - prev.ax) * 0.08,
      }));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const onPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    tilt.current = {
      ay: ((event.clientX - rect.left) / rect.width - 0.5) * 0.9,
      ax: ((event.clientY - rect.top) / rect.height - 0.5) * -0.6,
    };
  };

  const togglePin = (id) => setPinned((current) => (current === id ? null : id));

  const g = narrow ? GEOMETRY.narrow : GEOMETRY.wide;
  const points = Object.fromEntries(NODES.map((n) => [n.id, project(n.p, angle.ay, angle.ax, g)]));
  const lit = active ? new Set([active, ...neighbours(active)]) : null;
  const depthOpacity = (z) => 0.35 + (1 - (z + 1.2) / 2.4) * 0.65; // nearer = brighter
  const sorted = [...NODES].sort((a, b) => points[b.id].z - points[a.id].z); // paint far → near
  const activeNode = NODES.find((n) => n.id === active);
  const activeWork = activeNode
    ? activeNode.work.map((id) => projects.find((p) => p.id === id)).filter(Boolean)
    : [];

  return (
    <div
      className="relative h-full overflow-hidden bg-olive text-bone"
      onPointerMove={onPointerMove}
      onPointerLeave={() => (tilt.current = { ay: 0, ax: 0 })}
    >
      <svg
        viewBox={`0 0 ${g.W} ${g.H}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label="Practice map: connected skills; select one to see the projects that use it"
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
                strokeOpacity={lit ? (on ? 1 : 0.08) : depthOpacity((pa.z + pb.z) / 2) * 0.55}
              />
            );
          })}
        </g>

        {sorted.map((node) => {
          const pt = points[node.id];
          const isActive = active === node.id;
          const isLit = !lit || lit.has(node.id);
          const right = pt.x < g.W / 2 + g.W * 0.14; // label side, so text stays inside the frame
          const opacity = isLit ? (lit ? 1 : depthOpacity(pt.z)) : 0.15;
          return (
            <g
              key={node.id}
              tabIndex={0}
              role="button"
              aria-label={`${node.label}, connected to ${neighbours(node.id).map(labelOf).join(", ")}`}
              aria-pressed={pinned === node.id}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.id)}
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
              <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={(isActive ? 7 : 4.5) * pt.scale}
                style={{ fill: isActive ? "rgb(var(--signal))" : lit && isLit ? "rgb(var(--pink))" : "rgb(var(--bone))", stroke: "rgb(var(--ink))" }}
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

      {/* where the selected skill shows up in the work */}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 tablet:inset-x-6 tablet:bottom-6" aria-live="polite">
        {activeNode ? (
          <div className="pointer-events-auto max-w-[400px] bg-bone p-4 text-ink">
            <p className="fu-title text-phi1">{activeNode.label}</p>
            <p className="fu-meta mt-2 text-graphite">
              Linked to {neighbours(activeNode.id).map(labelOf).join(" / ")}
            </p>
            {activeWork.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1 border-t border-concrete pt-3 text-[15px] font-medium">
                {activeWork.map((work) => (
                  <li key={work.id}>
                    <Link href={`/projects/${work.id}`} className="hover:underline">
                      ↗ {work.title.split(" - ")[0]}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {pinned === activeNode.id && <p className="fu-meta mt-3 text-fieldgrey">Click the node again to unpin</p>}
          </div>
        ) : (
          <p className="fu-meta text-bone/70">Hover or tap a skill to see where it shows up</p>
        )}
      </div>
    </div>
  );
};

export default PracticeMap;
