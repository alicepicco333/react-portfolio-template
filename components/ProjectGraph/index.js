import React from "react";
import { NODES, EDGES, project3d } from "../Graph/data";

// The practice graph again, small and still, with the skills this project used lit up.
const G = { W: 320, H: 250, sx: 118, sy: 96, dy: 0 };
const REST = { ay: -0.35, ax: 0.18 };

const ProjectGraph = ({ projectId }) => {
  const used = new Set(NODES.filter((n) => n.work.includes(projectId)).map((n) => n.id));
  if (!used.size) return null;
  const pts = Object.fromEntries(NODES.map((n) => [n.id, project3d(n.p, REST.ay, REST.ax, G)]));
  const names = NODES.filter((n) => used.has(n.id)).map((n) => n.label);

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${G.W} ${G.H}`}
        className="w-full max-w-[320px] bg-olive"
        role="img"
        aria-label={`Skills used in this project: ${names.join(", ")}`}
      >
        {EDGES.map(([a, b]) => {
          const on = used.has(a) && used.has(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={pts[a].x}
              y1={pts[a].y}
              x2={pts[b].x}
              y2={pts[b].y}
              style={{ stroke: on ? "rgb(var(--signal))" : "rgb(var(--bone))" }}
              strokeOpacity={on ? 1 : 0.18}
              strokeWidth={on ? 1.6 : 1}
            />
          );
        })}
        {NODES.map((n) => {
          const p = pts[n.id];
          const on = used.has(n.id);
          const right = p.x < G.W * 0.62;
          return (
            <g key={n.id} opacity={on ? 1 : 0.35}>
              <circle cx={p.x} cy={p.y} r={on ? 4.5 : 2.5} style={{ fill: on ? "rgb(var(--signal))" : "rgb(var(--bone))" }} />
              {on && (
                <text
                  x={p.x + (right ? 8 : -8)}
                  y={p.y + 4}
                  textAnchor={right ? "start" : "end"}
                  fontFamily="Instrument Sans, sans-serif"
                  fontSize="11"
                  fontWeight="600"
                  style={{ fill: "rgb(var(--bone))" }}
                >
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="fu-meta text-fieldgrey">Skills in this project</figcaption>
    </figure>
  );
};

export default ProjectGraph;
