import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sigil - Runtime Identity Drift Detection and Response",
  description: "Context-Aware Identity Drift Detection and Response for Autonomous AI Agents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
