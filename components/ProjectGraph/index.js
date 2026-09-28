import React, { useState } from "react";
import Link from "next/link";
import portfolioData from "../../data/portfolio.json";
import { NODES, EDGES, project3d } from "../Graph/data";

// The practice graph again, small and still, with the skills this project used lit up.
// Lit skills are buttons: hover, focus or tap one to see its tools and the other projects
// that use it, and jump to the home map opened on that skill.
const G = { W: 320, H: 250, sx: 118, sy: 96, dy: 0 };
const REST = { ay: -0.35, ax: 0.18 };
const titleOf = (id) => portfolioData.projects.find((p) => p.id === id);

const ProjectGraph = ({ projectId }) => {
  const [hover, setHover] = useState(null);
  const [picked, setPicked] = useState(null);
  const used = new Set(NODES.filter((n) => n.work.includes(projectId)).map((n) => n.id));
  if (!used.size) return null;
  const pts = Object.fromEntries(NODES.map((n) => [n.id, project3d(n.p, REST.ay, REST.ax, G)]));
  const names = NODES.filter((n) => used.has(n.id)).map((n) => n.label);
  const current = hover || picked;
  const node = current ? NODES.find((n) => n.id === current) : null;
  const others = node ? node.work.filter((id) => id !== projectId).map(titleOf).filter(Boolean) : [];

  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${G.W} ${G.H}`}
        className="w-full max-w-[320px] bg-olive"
        role="group"
        aria-label={`Skills used in this project: ${names.join(", ")}. Select one for details.`}
      >
        {EDGES.map(([a, b]) => {
          const on = used.has(a) && used.has(b);
          const hot = current && (a === current || b === current) && used.has(a) && used.has(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={pts[a].x}
              y1={pts[a].y}
              x2={pts[b].x}
              y2={pts[b].y}
              style={{ stroke: on ? "rgb(var(--signal))" : "rgb(var(--bone))" }}
              strokeOpacity={on ? (current && !hot ? 0.45 : 1) : 0.18}
              strokeWidth={hot ? 2.4 : on ? 1.6 : 1}
            />
          );
        })}
        {NODES.map((n) => {
          const p = pts[n.id];
          const on = used.has(n.id);
          const sel = current === n.id;
          const right = p.x < G.W * 0.62;
          if (!on) {
            return <circle key={n.id} cx={p.x} cy={p.y} r={2.5} opacity={0.35} style={{ fill: "rgb(var(--bone))" }} />;
          }
          return (
            <g
              key={n.id}
              tabIndex={0}
              role="button"
              aria-pressed={picked === n.id}
              aria-label={`${n.label}: show tools and other projects`}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n.id)}
              onBlur={() => setHover(null)}
              onClick={() => setPicked((v) => (v === n.id ? null : n.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPicked((v) => (v === n.id ? null : n.id));
                }
              }}
              style={{ cursor: "pointer", outline: "none" }}
            >
              <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
              <circle cx={p.x} cy={p.y} r={sel ? 6.5 : 4.5} style={{ fill: "rgb(var(--signal))", stroke: "rgb(var(--ink))" }} strokeWidth={sel ? 1.5 : 0} />
              <text
                x={p.x + (right ? 9 : -9)}
                y={p.y + 4}
                textAnchor={right ? "start" : "end"}
                fontFamily="Instrument Sans, sans-serif"
                fontSize="11"
                fontWeight={sel ? 700 : 600}
                style={{ fill: "rgb(var(--bone))", textDecoration: sel ? "underline" : "none" }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="max-w-[320px] text-[13px] leading-snug" aria-live="polite">
        {node ? (
          <span className="flex flex-col gap-1">
            <span className="font-semibold">{node.label}</span>
            <span className="text-graphite">{node.tools.join(" · ")}</span>
            {others.length > 0 && (
              <span className="text-graphite">
                Also in:{" "}
                {others.map((p, i) => (
                  <React.Fragment key={p.id}>
                    {i > 0 && ", "}
                    <Link href={`/projects/${p.id}`} className="underline decoration-olive underline-offset-2">
                      {p.title}
                    </Link>
                  </React.Fragment>
                ))}
              </span>
            )}
            <Link href={`/?skill=${node.id}#map`} className="mt-1 w-max font-semibold underline decoration-olive decoration-2 underline-offset-2">
              Open in the map →
            </Link>
          </span>
        ) : (
          <span className="fu-meta text-fieldgrey">Skills in this project · select one</span>
        )}
      </figcaption>
    </figure>
  );
};

export default ProjectGraph;
