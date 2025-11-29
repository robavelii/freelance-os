"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProjectStatus } from "@/lib/prisma/generated/enums";

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  clientId: z.string().min(1, "Client is required"),
  hourlyRate: z.coerce.number().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export async function getProjects() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const projects = await prisma.project.findMany({
    where: { client: { userId } }, // Ensure project belongs to a client owned by user
    orderBy: { updatedAt: "desc" },
    include: {
      client: true,
      _count: { select: { timeEntries: true } }
    }
  });

  // Convert Decimal to number for client component serialization
  return projects.map(project => ({
    ...project,
    hourlyRate: project.hourlyRate ? Number(project.hourlyRate) : null,
  }));
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


export async function updateProject(projectId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  const data = Object.fromEntries(formData.entries());
  const parsed = projectSchema.safeParse(data);

  if (!parsed.success) {
    return { message: "Invalid data", errors: parsed.error.flatten().fieldErrors };
  }

  // Verify project belongs to user's client
  const project = await prisma.project.findFirst({
    where: { id: projectId, client: { userId } },
  });

  if (!project) {
    return { message: "Project not found" };
  }

  // If changing client, verify new client belongs to user
  if (parsed.data.clientId !== project.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: parsed.data.clientId, userId },
    });
    if (!client) {
      return { message: "Invalid client" };
    }
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        name: parsed.data.name,
        clientId: parsed.data.clientId,
        hourlyRate: parsed.data.hourlyRate,
        status: parsed.data.status,
      },
    });
    revalidatePath("/projects");
    return { message: "Project updated", success: true };
  } catch (e) {
    return { message: "Failed to update project" };
  }
}

export async function deleteProject(projectId: string) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  // Verify project belongs to user's client
  const project = await prisma.project.findFirst({
    where: { id: projectId, client: { userId } },
  });

  if (!project) {
    return { message: "Project not found" };
  }

  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    revalidatePath("/projects");
    return { message: "Project deleted", success: true };
  } catch (e) {
    return { message: "Failed to delete project" };
  }
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  const project = await prisma.project.findFirst({
    where: { id: projectId, client: { userId } },
  });

  if (!project) {
    return { message: "Project not found" };
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });
    revalidatePath("/projects");
    return { message: "Status updated", success: true };
  } catch (e) {
    return { message: "Failed to update status" };
  }
}
