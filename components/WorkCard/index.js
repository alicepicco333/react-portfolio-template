import React from "react";
import { categoryMeta, withBase } from "../../utils";

// Square image tile, flush-left caption underneath. Without an image the square
// becomes a flat colour field in the project's category tone.
const WorkCard = ({ img, name, description, tags, category, cardNumber }) => {
  const { tone } = categoryMeta(category);

  return (
    <article className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden" style={{ background: tone }}>
        {img ? (
          <img src={withBase(img)} alt={name} className="h-full w-full object-cover" draggable={false} loading="lazy" />
        ) : (
          <div className="flex h-full items-end p-4">
            <span className="fu-title text-phi1">{name}</span>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="fu-meta text-fieldgrey">{cardNumber}</span>
        <h4 className="fu-title text-xl">{name}</h4>
      </div>
      <p className="text-[15px] leading-snug text-graphite">{description}</p>
      {tags?.length > 0 && <p className="fu-meta text-fieldgrey">{tags.join(", ")}</p>}
    </article>
  );
};

export default WorkCard;
