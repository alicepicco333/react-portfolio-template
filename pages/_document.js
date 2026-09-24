import { Html, Head, Main, NextScript } from "next/document";
import { RESTORE_SCRIPT } from "../utils/palette";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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
