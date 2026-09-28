import React from "react";
import { RING } from "../Graph/data";

// A project's sigil: a ring with one spoke per skill it uses, read clockwise from Anthropology.
// `SigilG` draws inside an existing <svg>; `Sigil` is a standalone icon.
export const SigilG = ({ cx, cy, r, skills, color = "rgb(var(--olive))", bg = "rgb(var(--bone))", width = 2, ring = true, className }) => {
  const pts = RING.map((id, i) => {
    if (!skills.includes(id)) return null;
    const a = -Math.PI / 2 + (2 * Math.PI * i) / RING.length;
    return [cx + r * 0.92 * Math.cos(a), cy + r * 0.92 * Math.sin(a)];
  }).filter(Boolean);
  return (
    <g className={className}>
      {ring && <circle cx={cx} cy={cy} r={r} style={{ fill: bg, stroke: color }} strokeWidth="1" />}
      {pts.map(([x, y]) => (
        <line key={`${x}-${y}`} className="sigil-spoke" x1={cx} y1={cy} x2={x} y2={y} style={{ stroke: color }} strokeWidth={width} />
      ))}
      {pts.length > 2 && (
        <polygon points={pts.map((p) => p.join(",")).join(" ")} style={{ fill: color, stroke: color }} fillOpacity="0.18" strokeWidth="1" />
      )}
      <circle cx={cx} cy={cy} r={Math.max(1.6, r * 0.12)} style={{ fill: color }} />
    </g>
  );
};

const Sigil = ({ skills, size = 26, className = "", ...rest }) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true" focusable="false">
    <SigilG cx={size / 2} cy={size / 2} r={size / 2 - 1} skills={skills} {...rest} />
  </svg>
);

export default Sigil;
