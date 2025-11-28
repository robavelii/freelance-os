"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const timeEntrySchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  description: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

export async function getTimeEntries() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.timeEntry.findMany({
    where: { project: { client: { userId } } },
    orderBy: { startTime: "desc" },
    include: { project: { include: { client: true } } }
  });
}

export async function createTimeEntry(data: z.infer<typeof timeEntrySchema>) {
    const { userId } = await auth();
    if (!userId) return { message: "Unauthorized" };

    const parsed = timeEntrySchema.safeParse(data);
    if (!parsed.success) {
        return { message: "Invalid data", errors: parsed.error.flatten().fieldErrors };
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
        where: { id: parsed.data.projectId, client: { userId } }
    });

    if (!project) return { message: "Invalid project" };

    try {
        await prisma.timeEntry.create({
            data: {
                projectId: parsed.data.projectId,
                description: parsed.data.description,
                startTime: parsed.data.startTime,
                endTime: parsed.data.endTime,
                duration: Math.round((parsed.data.endTime.getTime() - parsed.data.startTime.getTime()) / 1000)
            }
        });
        revalidatePath("/timer");
        return { success: true, message: "Time entry saved" };
    } catch (e) {
        return { message: "Failed to save time entry" };
    }
}
