"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  company: z.string().optional(),
  address: z.string().optional(),
});

export async function getClients() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Ensure user exists in DB (sync with Clerk)
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
      // This might happen if webhook hasn't fired yet or first login
      // For now, lazily create user
      const clerkUser = await (await import("@clerk/nextjs/server")).currentUser();
      if (clerkUser) {
          user = await prisma.user.create({
              data: {
                  id: userId,
                  email: clerkUser.emailAddresses[0].emailAddress,
                  name: `${clerkUser.firstName} ${clerkUser.lastName}`,
              }
          })
      }
  }

  return await prisma.client.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
        _count: {
            select: { projects: true, invoices: true }
        }
    }
  });
}

export async function createClient(prevState: any, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  const data = Object.fromEntries(formData.entries());
  const parsed = clientSchema.safeParse(data);

  if (!parsed.success) {
    return { message: "Invalid data", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.client.create({
      data: {
        ...parsed.data,
        userId,
      },
    });
    revalidatePath("/clients");
    return { message: "Client created", success: true };
  } catch (e) {
    return { message: "Failed to create client" };
  }
}

export async function getClientById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.client.findUnique({
    where: { id, userId },
    include: {
      projects: { orderBy: { updatedAt: "desc" } },
      invoices: { orderBy: { issueDate: "desc" } },
    },
  });
}
