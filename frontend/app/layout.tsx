import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MediTrack AI",
  description:
    "Cloud-based multi-agent medical record intelligence powered by Supabase and FastAPI"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-slate-50">
      <body className="min-h-screen antialiased text-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col px-6 py-8">{children}</div>
      </body>
    </html>
  );
}

