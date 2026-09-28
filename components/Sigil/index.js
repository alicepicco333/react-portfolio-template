import React from "react";
import { CLUSTERS } from "../Graph/data";

// A project's sigil: a five-point figure, one point per skill cluster (Listening, Shaping,
// Playing, Counting, Ordering, clockwise from the top). Each point reaches further out the more
// of that cluster's skills the project uses, so every project draws its own shape.
// `SigilG` draws inside an existing <svg>; `Sigil` is a standalone icon.
const BASE = 0.26;

export const SigilG = ({ cx, cy, r, skills, color = "rgb(var(--olive))", bg = "rgb(var(--bone))", width = 2, ring = true, className }) => {
  const axes = CLUSTERS.map((c, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / CLUSTERS.length;
    const used = c.skills.filter((s) => skills.includes(s)).length;
    const v = BASE + (1 - BASE) * (used / c.skills.length);
    return { used, x: cx + r * v * Math.cos(a), y: cy + r * v * Math.sin(a), ox: cx + r * Math.cos(a), oy: cy + r * Math.sin(a) };
  });
  const frame = axes.map((p) => `${p.ox},${p.oy}`).join(" ");
  const shape = axes.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <g className={className}>
      {ring && <polygon points={frame} style={{ fill: bg, stroke: color }} strokeWidth="1" strokeOpacity="0.4" strokeLinejoin="round" />}
      <polygon points={shape} style={{ fill: color }} fillOpacity="0.22" />
      {axes.map((p, i) => {
        const q = axes[(i + 1) % axes.length];
        return <line key={i} className="sigil-edge" x1={p.x} y1={p.y} x2={q.x} y2={q.y} style={{ stroke: color }} strokeWidth={width} strokeLinecap="round" />;
      })}
      {axes
        .filter((p) => p.used > 0)
        .map((p) => (
          <circle key={`${p.x}-${p.y}`} className="sigil-dot" cx={p.x} cy={p.y} r={Math.max(1.6, r * 0.11)} style={{ fill: color }} />
        ))}
    </g>
  );
};

const Sigil = ({ skills, size = 26, className = "", ...rest }) => {
  const r = size / 2 - Math.max(1.5, size * 0.05);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true" focusable="false">
      <SigilG cx={size / 2} cy={size / 2 + size * 0.04} r={r} skills={skills} {...rest} />
    </svg>
  );
};

export default Sigil;
