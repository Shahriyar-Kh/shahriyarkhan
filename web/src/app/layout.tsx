import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shahriyar Khan",
  description: "Software Engineer — Python & Django",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
