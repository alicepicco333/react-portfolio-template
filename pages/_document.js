import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.svg`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon-32.png`} />
        <link rel="apple-touch-icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/apple-touch-icon.png`} />
        {/* the colour shuffle is gone: forget any palette a visitor saved earlier */}
        <script dangerouslySetInnerHTML={{ __html: 'try{localStorage.removeItem("fu-palette")}catch(e){}' }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
