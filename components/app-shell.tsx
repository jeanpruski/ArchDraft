"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import TopNav from "@/components/top-nav";

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <TopNav collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main className={`transition-all duration-300 pl-[98px] ${collapsed ? "md:pl-[98px]" : "md:pl-[282px]"}`}>
        <div className="flex w-full flex-col gap-6 px-6 py-7">
          <header className="text-xl font-semibold">
            <Link href="/" className="text-[#102f6f] hover:underline">
              Outil interne de cadrage technique
            </Link>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
