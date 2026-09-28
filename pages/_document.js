import { Html, Head, Main, NextScript } from "next/document";
import { RESTORE_SCRIPT } from "../utils/palette";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.svg`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon-32.png`} />
        <link rel="apple-touch-icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/apple-touch-icon.png`} />
        {/* re-apply a shuffled palette before first paint, so the page doesn't flash the default colours */}
        <script dangerouslySetInnerHTML={{ __html: RESTORE_SCRIPT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
