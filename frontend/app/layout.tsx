import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "sigil - runtime identity drift detection for ai agents",
  description: "Runtime security and governance proxy that verifies agent intent before tool execution.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
