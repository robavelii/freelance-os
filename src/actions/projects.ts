"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  clientId: z.string().min(1, "Client is required"),
  hourlyRate: z.coerce.number().optional(),
});

export async function getProjects() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.project.findMany({
    where: { client: { userId } }, // Ensure project belongs to a client owned by user
    orderBy: { updatedAt: "desc" },
    include: {
      client: true,
      _count: { select: { timeEntries: true } }
    }
  });
}

export async function createProject(prevState: any, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  const data = Object.fromEntries(formData.entries());
  const parsed = projectSchema.safeParse(data);

  if (!parsed.success) {
    return { message: "Invalid data", errors: parsed.error.flatten().fieldErrors };
  }

  // Verify client belongs to user
  const client = await prisma.client.findUnique({
      where: { id: parsed.data.clientId, userId }
  });

  if (!client) {
      return { message: "Invalid client" };
  }

  try {
    await prisma.project.create({
      data: {
        name: parsed.data.name,
        clientId: parsed.data.clientId,
        hourlyRate: parsed.data.hourlyRate,
      },
    });
    revalidatePath("/projects");
    return { message: "Project created", success: true };
  } catch (e) {
    return { message: "Failed to create project" };
  }
}
