import React, { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../utils";

// A constellation of skills with no parent nodes: each skill links to the ones it
// actually feeds into. Positions are hand-placed in 3D (x, y, z in -1…1) so the
// shape stays asymmetric; the whole thing turns slowly and tilts with the pointer.
const NODES = [
  { id: "anth", label: "Anthropology", p: [-0.9, -0.7, 0.3] },
  { id: "ur", label: "User research", p: [-0.2, -0.85, 0.55] },
  { id: "cult", label: "Cultural analytics", p: [-0.75, 0.05, -0.1] },
  { id: "dh", label: "Digital humanities", p: [-0.45, -0.35, -0.6] },
  { id: "arch", label: "Digital archives", p: [-0.95, 0.55, -0.5] },
  { id: "sem", label: "Semantic web", p: [-0.3, 0.25, -0.95] },
  { id: "onto", label: "Ontologies", p: [-0.55, 0.8, -0.75] },
  { id: "hci", label: "HCI", p: [0.15, -0.55, 0.35] },
  { id: "ux", label: "UX design", p: [0.55, -0.8, 0.15] },
  { id: "ixd", label: "Interaction design", p: [0.35, -0.05, 0.75] },
  { id: "dv", label: "Data visualization", p: [0.05, 0.2, -0.35] },
  { id: "vis", label: "Visual design", p: [0.85, -0.35, -0.25] },
  { id: "3d", label: "3D & animation", p: [0.95, 0.25, 0.35] },
  { id: "ar", label: "AR filters", p: [0.6, 0.55, 0.8] },
  { id: "cc", label: "Creative coding", p: [0.25, 0.6, 0.2] },
  { id: "live", label: "Live coding", p: [0.45, 0.95, -0.3] },
  { id: "perf", label: "Performance", p: [0.9, 0.85, -0.6] },
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

const CX = 275;
const CY = 330;

function project([x, y, z], ay, ax) {
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const y1 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  const scale = 2.8 / (2.8 + z2); // perspective
  return { x: CX + x1 * scale * 232, y: CY + y1 * scale * 268, z: z2, scale };
}

const PracticeMap = ({ stats = [] }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [angle, setAngle] = useState({ ay: -0.35, ax: 0.18 });
  const [active, setActive] = useState(null);
  const tilt = useRef({ ay: 0, ax: 0 });
  const spin = useRef(-0.35);
  const activeRef = useRef(null);
  activeRef.current = active;

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

  const points = Object.fromEntries(NODES.map((n) => [n.id, project(n.p, angle.ay, angle.ax)]));
  const lit = active ? new Set([active, ...neighbours(active)]) : null;
  const depthOpacity = (z) => 0.35 + (1 - (z + 1.2) / 2.4) * 0.65; // nearer = brighter
  const sorted = [...NODES].sort((a, b) => points[b.id].z - points[a.id].z); // paint far → near
  const activeNode = NODES.find((n) => n.id === active);

  return (
    <div className="relative flex h-full flex-col bg-olive text-bone">
      <div className="fu-meta flex justify-between border-b border-[#6E7556] px-5 py-4 text-[11px]">
        <span>Fig. 01 — Practice map</span>
        <span>Move to turn · hover a node</span>
      </div>

      <div
        className="fu-grid-bg relative flex-grow overflow-hidden"
        onPointerMove={onPointerMove}
        onPointerLeave={() => (tilt.current = { ay: 0, ax: 0 })}
      >
        <svg
          viewBox="0 0 550 690"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Practice map: a network of connected skills, from anthropology and digital humanities to interaction design, creative coding and live coding"
        >
          <g strokeLinecap="round">
            {EDGES.map(([a, b]) => {
              const pa = points[a];
              const pb = points[b];
              const on = lit && lit.has(a) && lit.has(b) && (a === active || b === active);
              return (
                <line
                  key={`${a}-${b}`}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke={on ? "#D7FF3C" : "#E8E4DA"}
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
            const right = pt.x < CX + 80; // label side, so text stays inside the frame
            const opacity = isLit ? (lit ? 1 : depthOpacity(pt.z)) : 0.15;
            return (
              <g
                key={node.id}
                tabIndex={0}
                role="button"
                aria-label={`${node.label}, connected to ${neighbours(node.id)
                  .map((id) => NODES.find((n) => n.id === id).label)
                  .join(", ")}`}
                aria-pressed={isActive}
                onMouseEnter={() => setActive(node.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(node.id)}
                onBlur={() => setActive(null)}
                style={{ cursor: "pointer", outline: "none", opacity, transition: "opacity .3s" }}
              >
                <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />
                {isActive && <circle className="fu-pulse" cx={pt.x} cy={pt.y} r={7 * pt.scale} fill="none" stroke="#D7FF3C" strokeWidth="1.5" />}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={(isActive ? 7 : 4.5) * pt.scale}
                  fill={isActive ? "#D7FF3C" : lit && isLit ? "#F2C4CE" : "#E8E4DA"}
                  stroke="#151613"
                  strokeWidth="1"
                />
                <text
                  x={pt.x + (right ? 11 : -11)}
                  y={pt.y + 4}
                  textAnchor={right ? "start" : "end"}
                  fontFamily="Sligoil, monospace"
                  fontSize={10 + 2.5 * (pt.scale - 0.7)}
                  fontWeight={isActive ? 700 : 400}
                  fill={isActive ? "#D7FF3C" : "#E8E4DA"}
                >
                  {node.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="fu-meta grid min-h-[46px] grid-cols-3 border-t border-[#6E7556] text-[11px]">
        {activeNode ? (
          <span className="col-span-3 flex items-center px-5">
            {activeNode.label} → {neighbours(activeNode.id).map((id) => NODES.find((n) => n.id === id).label).join(" / ")}
          </span>
        ) : (
          stats.map((stat, i) => (
            <span
              key={stat}
              className={`flex items-center px-5 ${i < stats.length - 1 ? "border-r border-[#6E7556]" : ""}`}
            >
              {stat}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default PracticeMap;
