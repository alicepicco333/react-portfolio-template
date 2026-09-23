import React from "react";

// Seamless looping band: the item list is rendered twice and shifted by -50%.
const Marquee = ({ items, reverse = false, className = "", itemClassName = "", separator = null }) => {
  const renderRun = (runKey) =>
    items.map((item, index) => (
      <React.Fragment key={`${runKey}-${index}`}>
        <span className={itemClassName}>{item}</span>
        {separator}
      </React.Fragment>
    ));

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div className={`fu-mq ${reverse ? "fu-mq-rev" : ""} items-center gap-8 pr-8`}>
        {renderRun("a")}
        {renderRun("b")}
      </div>
    </div>
  );
};

export default Marquee;
