"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  receiptUrl: z.string().optional(),
});

export async function getExpenses() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(prevState: any, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  const data = Object.fromEntries(formData.entries());
  const parsed = expenseSchema.safeParse(data);

  if (!parsed.success) {
    return { message: "Invalid data", errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.expense.create({
      data: {
        userId,
        description: parsed.data.description,
        amount: parsed.data.amount,
        date: new Date(parsed.data.date),
        receiptUrl: parsed.data.receiptUrl,
      },
    });
    revalidatePath("/expenses");
    return { message: "Expense created", success: true };
  } catch (e) {
    return { message: "Failed to create expense" };
  }
}

export async function deleteExpense(id: string) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  // Verify expense belongs to user
  const expense = await prisma.expense.findUnique({
    where: { id, userId },
  });

  if (!expense) {
    return { message: "Expense not found" };
  }

  try {
    await prisma.expense.delete({
      where: { id },
    });
    revalidatePath("/expenses");
    return { message: "Expense deleted", success: true };
  } catch (e) {
    return { message: "Failed to delete expense" };
  }
}
