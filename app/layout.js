import Head from "next/head";
import "./global.css";
export const metadata = {
  title: "jsncrypts",
  description: "DecentralizedStack",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="shortcut icon" href="/app/favicon.ico" />
      </Head>
      <body>{children}</body>
    </html>
  );
}
