import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCSV, expenseColumns } from "@/lib/export/csv";

/**
 * GET /api/export/expenses
 * 
 * Exports all expenses for the authenticated user as CSV
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    const data = expenses.map((expense: { description: string; amount: unknown; date: Date; receiptUrl: string | null; createdAt: Date }) => ({
      description: expense.description,
      amount: String(expense.amount),
      date: expense.date.toISOString().split("T")[0],
      receiptUrl: expense.receiptUrl || "",
      createdAt: expense.createdAt.toISOString(),
    }));

    const csv = generateCSV({ data, columns: expenseColumns });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="expenses-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Expense export error:", error);
    return NextResponse.json(
      { error: "Failed to export expenses" },
      { status: 500 }
    );
  }
}
