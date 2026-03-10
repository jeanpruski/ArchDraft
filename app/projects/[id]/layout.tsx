import type { ReactNode } from "react";
import ProjectTabs from "@/components/project-tabs";

export default function ProjectLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { id: string };
}) {
  return (
    <div className="grid gap-4">
      <ProjectTabs projectId={params.id} />
      {children}
    </div>
  );
}
