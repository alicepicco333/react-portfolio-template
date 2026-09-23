import React, { useState } from "react";

// Three overlapping fields of practice. Skills sit in the field — or the overlap —
// they belong to; the centre, where all three meet, is Alice.
const FIELDS = [
  { id: "research", label: "Research", no: "01", cx: 200, cy: 290, tone: "#CFC6E8", lx: 58, ly: 112, anchor: "start" },
  { id: "design", label: "Design", no: "02", cx: 350, cy: 290, tone: "#F2C4CE", lx: 492, ly: 112, anchor: "end" },
  { id: "dev", label: "Development", no: "03", cx: 275, cy: 420, tone: "#C8D8BF", lx: 275, ly: 626, anchor: "middle" },
];

const SKILLS = [
  { label: "User research", in: ["research"], x: 76, y: 222, anchor: "start" },
  { label: "Digital humanities", in: ["research"], x: 76, y: 256, anchor: "start" },
  { label: "Cultural analytics", in: ["research"], x: 76, y: 290, anchor: "start" },
  { label: "Visual design", in: ["design"], x: 474, y: 222, anchor: "end" },
  { label: "3D & animation", in: ["design"], x: 474, y: 256, anchor: "end" },
  { label: "AR filters", in: ["design"], x: 474, y: 290, anchor: "end" },
  { label: "Front-end dev", in: ["dev"], x: 275, y: 522, anchor: "middle" },
  { label: "Live coding", in: ["dev"], x: 275, y: 546, anchor: "middle" },
  { label: "HCI", in: ["research", "design"], x: 275, y: 196, anchor: "middle" },
  { label: "UX design", in: ["research", "design"], x: 275, y: 222, anchor: "middle" },
  { label: "Data vis", in: ["research", "dev"], x: 185, y: 395, anchor: "middle" },
  { label: "Ontologies", in: ["research", "dev"], x: 180, y: 418, anchor: "middle" },
  { label: "Creative coding", in: ["design", "dev"], x: 365, y: 395, anchor: "middle" },
  { label: "Interaction", in: ["design", "dev"], x: 370, y: 418, anchor: "middle" },
];

const PracticeMap = ({ stats = [] }) => {
  const [active, setActive] = useState(null);
  const activeField = FIELDS.find((f) => f.id === active);
  const skillsOf = (id) => SKILLS.filter((s) => s.in.includes(id));
  const lit = (ids) => !active || ids.includes(active);

  const fieldHandlers = (id) => ({
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
  });

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
          aria-label="Practice map: research, design and development overlap; the skills in each field and overlap, with Alice in the middle"
        >
          {FIELDS.map((field, index) => (
            <circle
              key={field.id}
              className="fu-breathe"
              style={{
                animationDuration: `${7 + index * 1.7}s`,
                animationDelay: `${-index * 2}s`,
                fillOpacity: active === field.id ? 0.42 : active ? 0.06 : 0.16,
                transition: "fill-opacity .4s",
                cursor: "pointer",
              }}
              cx={field.cx}
              cy={field.cy}
              r="150"
              fill={field.tone}
              stroke={field.tone}
              strokeWidth="1.5"
              {...fieldHandlers(field.id)}
            />
          ))}

          {FIELDS.map((field) => (
            <g
              key={`${field.id}-label`}
              tabIndex={0}
              role="button"
              aria-label={`${field.label}: ${skillsOf(field.id).map((s) => s.label).join(", ")}`}
              aria-pressed={active === field.id}
              style={{ cursor: "pointer", outline: "none", opacity: lit([field.id]) ? 1 : 0.3, transition: "opacity .35s" }}
              {...fieldHandlers(field.id)}
            >
              <text x={field.lx} y={field.ly - 30} textAnchor={field.anchor} fontFamily="JetBrains Mono, monospace" fontSize="11" fill={field.tone}>
                {field.no} /
              </text>
              <text
                x={field.lx}
                y={field.ly}
                textAnchor={field.anchor}
                fontFamily="Archivo, sans-serif"
                fontWeight="800"
                fontSize="30"
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
                style={{ opacity: lit(skill.in) ? 1 : 0.18, transition: "opacity .35s" }}
                fontWeight={skill.in.length > 1 ? 700 : 400}
              >
                {skill.label.toUpperCase()}
              </text>
            ))}
          </g>

          {/* Alice, where the three fields meet */}
          <g pointerEvents="none">
            <circle className="fu-pulse" cx="275" cy="335" r="9" fill="none" stroke="#D7FF3C" strokeWidth="1.5" />
            <rect x="268" y="328" width="14" height="14" fill="#D7FF3C" stroke="#151613" />
            <text x="275" y="364" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="15" fill="#E8E4DA">
              ALICE
            </text>
          </g>

          {/* handwritten margin note */}
          <g pointerEvents="none" stroke="#D7FF3C" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path className="fu-draw" d="M440,580 C445,470 430,380 294,340" />
            <path d="M303,334 L294,340 L304,346" />
          </g>
          <text className="fu-hand" textAnchor="middle" fill="#D7FF3C" fontSize="23" pointerEvents="none">
            <tspan x="448" y="604">me, right in</tspan>
            <tspan x="448" y="628">the messy middle</tspan>
          </text>
        </svg>
      </div>

      <div className="fu-meta grid min-h-[46px] grid-cols-3 border-t border-[#6E7556] text-[11px]">
        {activeField ? (
          <span className="col-span-3 flex items-center gap-3 px-5">
            <span className="h-[10px] w-[10px] flex-shrink-0" style={{ background: activeField.tone }} />
            {activeField.label} → {skillsOf(activeField.id).map((s) => s.label).join(" / ")}
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
