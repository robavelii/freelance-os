"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserSettings } from "@/lib/settings";

const settingsSchema = z.object({
  businessName: z.string().nullable().optional(),
  businessAddress: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  currency: z.string().min(1).optional(),
  hourlyRate: z.number().nullable().optional(),
  invoicePrefix: z.string().min(1).max(10).optional(),
  paymentTermsDays: z.number().int().min(1).max(365).optional(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

/**
 * Ensures the user exists in the database, creating them if necessary
 */
async function ensureUser(clerkUserId: string): Promise<string> {
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true },
  });

  if (!user) {
    // Get user info from Clerk
    const clerkUser = await currentUser();
    
    // Create user in database
    user = await prisma.user.create({
      data: {
        id: clerkUserId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || "",
        name: clerkUser?.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
          : null,
      },
      select: { id: true },
    });
  }

  return user.id;
}

/**
 * Gets the current user's settings
 */
export async function getSettings(): Promise<UserSettings> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dbUserId = await ensureUser(userId);

  const user = await prisma.user.findUnique({
    where: { id: dbUserId },
    select: {
      businessName: true,
      businessAddress: true,
      logoUrl: true,
      currency: true,
      hourlyRate: true,
      invoicePrefix: true,
      paymentTermsDays: true,
    },
  });

  if (!user) {
    return {
      businessName: null,
      businessAddress: null,
      logoUrl: null,
      currency: "USD",
      hourlyRate: null,
      invoicePrefix: "INV",
      paymentTermsDays: 30,
    };
  }

  return {
    businessName: user.businessName,
    businessAddress: user.businessAddress,
    logoUrl: user.logoUrl,
    currency: user.currency,
    hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : null,
    invoicePrefix: user.invoicePrefix,
    paymentTermsDays: user.paymentTermsDays,
  };
}

/**
 * Updates the current user's settings
 */
export async function updateSettings(
  settings: SettingsInput
): Promise<{ success: boolean; message?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Unauthorized" };

  const parsed = settingsSchema.safeParse(settings);
  if (!parsed.success) {
    return { success: false, message: "Invalid settings data" };
  }

  const dbUserId = await ensureUser(userId);

  try {
    const updateData: Record<string, unknown> = {};

    if (parsed.data.businessName !== undefined) {
      updateData.businessName = parsed.data.businessName;
    }
    if (parsed.data.businessAddress !== undefined) {
      updateData.businessAddress = parsed.data.businessAddress;
    }
    if (parsed.data.logoUrl !== undefined) {
      updateData.logoUrl = parsed.data.logoUrl;
    }
    if (parsed.data.currency !== undefined) {
      updateData.currency = parsed.data.currency;
    }
    if (parsed.data.hourlyRate !== undefined) {
      updateData.hourlyRate = parsed.data.hourlyRate;
    }
    if (parsed.data.invoicePrefix !== undefined) {
      updateData.invoicePrefix = parsed.data.invoicePrefix;
    }
    if (parsed.data.paymentTermsDays !== undefined) {
      updateData.paymentTermsDays = parsed.data.paymentTermsDays;
    }

    await prisma.user.update({
      where: { id: dbUserId },
      data: updateData,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, message: "Failed to save settings" };
  }
}
