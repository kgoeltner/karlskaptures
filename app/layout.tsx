import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";

const raleway = Raleway({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "karlskaptures",
  description: "Photography by Karl Goeltner",
  icons: {
    icon: "/photos/karlskaptures.png",
    apple: "/photos/karlskaptures.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${raleway.variable} font-sans antialiased bg-black text-neutral-100`}
      >
        <Nav />
        {children}
      </body>
    </html>
  );
}
