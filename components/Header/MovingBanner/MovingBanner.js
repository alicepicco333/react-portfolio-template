const MovingBanner = () => {
  const repeatedText = Array(10)
    .fill("ANTHROPOLOGY / DIGITAL HUMANITIES / DESIGN")
    .join("   /   ");

  return (
<div className="sticky w-full inset-x-0 top-0 bg-white dark:bg-black py-1 overflow-hidden ">
  <div
    className="inline-block animate-scroll whitespace-nowrap text-lg font-semibold text-black"
    style={{ minWidth: "200%" }}
  >
    {repeatedText}
  </div>
</div>
  );
};

export default MovingBanner;
