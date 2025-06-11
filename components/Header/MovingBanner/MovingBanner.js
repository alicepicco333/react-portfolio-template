const MovingBanner = () => {
  // Repeat the text 10 times for smoothness
  const repeatedText = Array(10).fill("ANTHROPOLOGY / DIGITAL HUMANITIES / DESIGN").join("   /   ");

  return (
    <div className="overflow-hidden whitespace-nowrap bg-pink-400 dark:bg-gray-900 py-2 mx-0 w-full">
      <div
        className="inline-block animate-scroll text-lg font-semibold"
        style={{ minWidth: "200%" }}
      >
        {repeatedText}
      </div>
    </div>
  );
};

export default MovingBanner;
