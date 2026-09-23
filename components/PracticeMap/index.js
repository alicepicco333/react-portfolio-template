import React, { useState } from "react";

// Two overlapping fields of practice. Skills sit in the field they belong to;
// the overlap — creative technology — is where Alice works.
const FIELDS = [
  { id: "research", label: "Research", no: "01", cx: 195, cy: 330, tone: "#CFC6E8", lx: 40, ly: 128, anchor: "start" },
  { id: "design", label: "Design", no: "02", cx: 355, cy: 330, tone: "#F2C4CE", lx: 510, ly: 128, anchor: "end" },
];
const OVERLAP = { id: "both", label: "Creative technology", no: "03", tone: "#D7FF3C" };

const SKILLS = [
  { label: "User research", in: ["research"], x: 48, y: 258, anchor: "start" },
  { label: "Digital humanities", in: ["research"], x: 48, y: 294, anchor: "start" },
  { label: "Cultural analytics", in: ["research"], x: 48, y: 330, anchor: "start" },
  { label: "Ontologies", in: ["research"], x: 48, y: 366, anchor: "start" },
  { label: "Semantic web", in: ["research"], x: 48, y: 402, anchor: "start" },
  { label: "Visual design", in: ["design"], x: 502, y: 258, anchor: "end" },
  { label: "3D & animation", in: ["design"], x: 502, y: 294, anchor: "end" },
  { label: "AR filters", in: ["design"], x: 502, y: 330, anchor: "end" },
  { label: "Creative coding", in: ["design"], x: 502, y: 366, anchor: "end" },
  { label: "Live coding", in: ["design"], x: 502, y: 402, anchor: "end" },
  { label: "HCI", in: ["research", "design"], x: 275, y: 246, anchor: "middle" },
  { label: "UX design", in: ["research", "design"], x: 275, y: 272, anchor: "middle" },
  { label: "Interaction", in: ["research", "design"], x: 275, y: 392, anchor: "middle" },
  { label: "Data vis", in: ["research", "design"], x: 275, y: 418, anchor: "middle" },
];

const PracticeMap = ({ stats = [] }) => {
  const [active, setActive] = useState(null);

  const skillsFor = (id) => SKILLS.filter((s) => (id === "both" ? s.in.length > 1 : s.in.includes(id)));
  const lit = (skill) => !active || (active === "both" ? skill.in.length > 1 : skill.in.includes(active));
  const labelLit = (id) => !active || active === id;
  const activeInfo = active === "both" ? OVERLAP : FIELDS.find((f) => f.id === active);

  const handlers = (id) => ({
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
  });

  const fillFor = (id) => {
    if (!active) return 0.16;
    if (active === "both") return 0.3;
    return active === id ? 0.42 : 0.06;
  };

  return (
    <div className="relative flex h-full flex-col bg-olive text-bone">
      <div className="fu-meta flex justify-between border-b border-[#6E7556] px-5 py-4 text-[11px]">
        <span>Fig. 01 — Practice map</span>
        <span>Hover a field ↘</span>
      </div>

      <div className="fu-grid-bg relative flex-grow overflow-hidden">
        <svg
          viewBox="0 0 550 690"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Practice map: research and design overlap in creative technology, where Alice works"
        >
          {FIELDS.map((field, index) => (
            <circle
              key={field.id}
              className="fu-breathe"
              style={{
                animationDuration: `${7 + index * 1.7}s`,
                animationDelay: `${-index * 2}s`,
                fillOpacity: fillFor(field.id),
                transition: "fill-opacity .4s",
                cursor: "pointer",
              }}
              cx={field.cx}
              cy={field.cy}
              r="170"
              fill={field.tone}
              stroke={field.tone}
              strokeWidth="1.5"
              {...handlers(field.id)}
            />
          ))}

          {FIELDS.map((field) => (
            <g
              key={`${field.id}-label`}
              tabIndex={0}
              role="button"
              aria-label={`${field.label}: ${skillsFor(field.id).map((s) => s.label).join(", ")}`}
              aria-pressed={active === field.id}
              style={{ cursor: "pointer", outline: "none", opacity: labelLit(field.id) ? 1 : 0.3, transition: "opacity .35s" }}
              {...handlers(field.id)}
            >
              <text x={field.lx} y={field.ly - 32} textAnchor={field.anchor} fontFamily="JetBrains Mono, monospace" fontSize="11" fill={field.tone}>
                {field.no} /
              </text>
              <text
                x={field.lx}
                y={field.ly}
                textAnchor={field.anchor}
                fontFamily="Archivo, sans-serif"
                fontWeight="800"
                fontSize="32"
                fill="#E8E4DA"
                style={{ fontStretch: "62%" }}
              >
                {field.label.toUpperCase()}
              </text>
            </g>
          ))}

          <g fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#E8E4DA" pointerEvents="none">
            {SKILLS.map((skill) => (
              <text
                key={skill.label}
                x={skill.x}
                y={skill.y}
                textAnchor={skill.anchor}
                style={{ opacity: lit(skill) ? 1 : 0.18, transition: "opacity .35s" }}
                fontWeight={skill.in.length > 1 ? 700 : 400}
              >
                {skill.label.toUpperCase()}
              </text>
            ))}
          </g>

          {/* Alice, in the overlap */}
          <g pointerEvents="none">
            <circle className="fu-pulse" cx="275" cy="322" r="7" fill="none" stroke="#D7FF3C" strokeWidth="1.5" />
            <circle cx="275" cy="322" r="7" fill="#D7FF3C" stroke="#151613" />
            <text x="275" y="352" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="15" fill="#E8E4DA">
              ALICE
            </text>
          </g>

          {/* the overlap, named */}
          <g
            tabIndex={0}
            role="button"
            aria-label={`${OVERLAP.label}: ${skillsFor("both").map((s) => s.label).join(", ")}`}
            aria-pressed={active === "both"}
            style={{ cursor: "pointer", outline: "none", opacity: !active || active === "both" ? 1 : 0.3, transition: "opacity .35s" }}
            {...handlers("both")}
          >
            <line x1="275" y1="482" x2="275" y2="548" stroke="#D7FF3C" strokeWidth="1.2" strokeDasharray="2 4" />
            <text x="275" y="576" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#D7FF3C">
              {OVERLAP.no} /
            </text>
            <text
              x="275"
              y="610"
              textAnchor="middle"
              fontFamily="Archivo, sans-serif"
              fontWeight="800"
              fontSize="32"
              fill="#E8E4DA"
              style={{ fontStretch: "62%" }}
            >
              {OVERLAP.label.toUpperCase()}
            </text>
          </g>
        </svg>
      </div>

      <div className="fu-meta grid min-h-[46px] grid-cols-3 border-t border-[#6E7556] text-[11px]">
        {activeInfo ? (
          <span className="col-span-3 flex items-center gap-3 px-5">
            <span className="h-[10px] w-[10px] flex-shrink-0" style={{ background: activeInfo.tone }} />
            {activeInfo.label} → {skillsFor(activeInfo.id).map((s) => s.label).join(" / ")}
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
