import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const neueMontreal = localFont({
  src: [
    {
      path: "../fonts/pp-neue-montreal-cufonfonts/ppneuemontreal-thin.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/pp-neue-montreal-cufonfonts/ppneuemontreal-book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/pp-neue-montreal-cufonfonts/ppneuemontreal-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/pp-neue-montreal-cufonfonts/ppneuemontreal-bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});
export const metadata: Metadata = {
  title: "Evrything AI",
  description: "Democratising AI for everybody",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${neueMontreal.variable} antialiased font-sans`}>
        {children}
        <style dangerouslySetInnerHTML={{ __html: `nextjs-portal, #__next-build-watcher, [data-nextjs-dialog-overlay] { display: none !important; }` }} />
      </body>
    </html>
  );
}
