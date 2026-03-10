"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TopNavProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const items = [
  { href: "/", label: "Tableau de bord", short: "TB" },
  { href: "/projects", label: "Projets", short: "PR" },
  { href: "/clients", label: "Clients", short: "CL" },
  { href: "/systems", label: "Systèmes", short: "SY" }
];

export default function TopNav({ collapsed, onToggle }: TopNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 border-r border-[#dce8f2] bg-white/95 backdrop-blur transition-all duration-300 w-[86px] ${collapsed ? "md:w-[86px]" : "md:w-[270px]"}`}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-[#dce8f2] p-3">
          <button
            type="button"
            onClick={onToggle}
            className="w-full rounded-xl border border-[#dce8f2] bg-white p-2 text-left hover:bg-[#f4f9ff]"
            aria-label="Réduire ou étendre le menu"
          >
            {collapsed ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                <Image src="/archdraft-mark.svg" alt="ArchDraft" width={34} height={34} priority />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Image src="/archdraft-logo.svg" alt="ArchDraft" width={170} height={42} priority />
              </div>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {items.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${active ? "bg-[#eaf8f3] text-[#0f7f64]" : "text-[#304b66] hover:bg-[#edf6ff] hover:text-[#102f6f]"}`}
                title={item.label}
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md border ${active ? "border-[#bde4d8] bg-white" : "border-[#dce8f2] bg-[#fbfdff]"}`}>
                  {item.short}
                </span>
                <span className={`${collapsed ? "hidden" : "hidden md:inline"}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
