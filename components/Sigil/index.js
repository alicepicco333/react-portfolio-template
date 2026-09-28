import React from "react";
import { RING } from "../Graph/data";

// A project's sigil: the centre plus one vertex per skill the project uses, joined into a fan
// (two skills make a triangle). Each skill has a fixed place on the circle; the places step
// 4 of 15 at a time, so neighbouring skills sit about 96° apart and every mix draws its own shape.
// `SigilG` draws inside an existing <svg>; `Sigil` is a standalone icon.
const SLOT = Object.fromEntries(RING.map((id, i) => [id, (i * 4) % RING.length]));
const angleOf = (slot) => -Math.PI / 2 + (2 * Math.PI * slot) / RING.length;

export const SigilG = ({ cx, cy, r, skills, color = "rgb(var(--olive))", width = 2, className }) => {
  let angles = skills
    .filter((s) => s in SLOT)
    .map((s) => angleOf(SLOT[s]))
    .sort((a, b) => a - b);
  // one skill: a narrow triangle rather than a line
  if (angles.length === 1) angles = [angles[0] - 0.35, angles[0] + 0.35];
  // leave the widest gap open, so the fan never folds over itself
  if (angles.length > 2) {
    const gaps = angles.map((a, i) => (i === angles.length - 1 ? angles[0] + 2 * Math.PI - a : angles[i + 1] - a));
    const widest = gaps.indexOf(Math.max(...gaps));
    angles = [...angles.slice(widest + 1), ...angles.slice(0, widest + 1)];
  }
  const pts = angles.map((a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  const outline = [[cx, cy], ...pts];
  const edges = outline.map((p, i) => [p, outline[(i + 1) % outline.length]]);
  const single = skills.filter((s) => s in SLOT).length === 1;
  return (
    <g className={className}>
      <polygon points={outline.map((p) => p.join(",")).join(" ")} style={{ fill: color }} fillOpacity="0.2" />
      {edges.map(([a, b], i) => (
        <line key={i} className="sigil-edge" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} style={{ stroke: color }} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {(single ? [[(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2]] : pts).map(([x, y]) => (
        <circle key={`${x}-${y}`} className="sigil-dot" cx={x} cy={y} r={Math.max(1.6, r * 0.1)} style={{ fill: color }} />
      ))}
    </g>
  );
};

const Sigil = ({ skills, size = 26, className = "", ...rest }) => {
  const r = size / 2 - Math.max(2, size * 0.08);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true" focusable="false">
      <SigilG cx={size / 2} cy={size / 2} r={r} skills={skills} {...rest} />
    </svg>
  );
};

export default Sigil;
