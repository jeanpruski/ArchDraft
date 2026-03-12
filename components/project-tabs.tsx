"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["Synthèse", "overview"],
  ["Informations projet", "info"],
  ["Questionnaire", "questionnaire"],
  ["Flux de synchronisation", "sync-flows"],
  ["Mappages de champs", "field-mappings"],
  ["Risques", "risks"],
  ["Questions ouvertes", "open-questions"],
  ["Chronologie", "timeline"]
];

export default function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 rounded-xl border border-[#dce8f2] bg-white p-2 shadow-[0_8px_18px_rgba(16,47,111,0.05)]">
      {tabs.map(([label, slug]) => {
        const href = `/projects/${projectId}/${slug}`;
        const isActive = pathname?.includes(`/projects/${projectId}/${slug}`);
        return (
          <Link
            key={slug}
            href={href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? "bg-[#102f6f] text-white" : "text-[#2d4a67] hover:bg-[#eaf6f2] hover:text-[#0f7f64]"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
