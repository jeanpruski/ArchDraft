import { prisma } from "./prisma";

export async function recomputeProjectComplexity(projectId: number): Promise<number> {
  const systems = await prisma.projectSystem.count({
    where: { projectId }
  });
  const flows = await prisma.syncFlow.count({
    where: { projectId }
  });
  const bidirectional = await prisma.syncFlow.count({
    where: { projectId, direction: "bidirectional" }
  });

  const score = systems * 1 + flows * 2 + bidirectional * 3;

  await prisma.project.update({
    where: { id: projectId },
    data: { complexityScore: score }
  });

  return score;
}
