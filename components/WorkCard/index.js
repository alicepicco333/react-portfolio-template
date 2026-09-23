import React from "react";
import { categoryMeta } from "../../utils";

const WorkCard = ({ img, name, description, tags, category, cardNumber, jp }) => {
  const { short, tone } = categoryMeta(category);

  return (
    <article className="flex h-full flex-col border border-ink bg-paper">
      <div className="relative flex h-[260px] items-center justify-center overflow-hidden border-b border-ink bg-concrete tablet:h-[340px]">
        {img ? (
          <img src={img} alt={name} className="h-full w-full object-cover" draggable={false} loading="lazy" />
        ) : (
          <span className="fu-display px-6 text-center text-[64px] text-ink/25 tablet:text-phi4">{name}</span>
        )}
        <span
          className="fu-meta absolute left-0 top-0 border-b border-r border-ink px-3 py-2 text-[11px]"
          style={{ background: tone }}
        >
          {cardNumber} · {short}
        </span>
        {jp && <span className="fu-jp absolute bottom-3 right-3 bg-ink px-2 py-1 text-xs text-bone">{jp}</span>}
      </div>

      <div className="fu-bar flex items-center justify-between gap-4 border-b border-ink px-5 py-4">
        <h3 className="fu-title text-[32px] tablet:text-phi2">{name}</h3>
        <span className="font-mono text-xl" aria-hidden="true">
          ↗
        </span>
      </div>

      <div className="flex flex-grow flex-col justify-between gap-4 px-5 pb-5 pt-4 tablet:flex-row tablet:gap-6">
        <p className="max-w-[440px] text-base leading-relaxed">{description}</p>
        <ul className="fu-meta flex flex-shrink-0 flex-wrap gap-x-3 text-[11px] leading-relaxed text-olive tablet:flex-col tablet:text-right">
          {tags?.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </article>
  );
};

export default WorkCard;
