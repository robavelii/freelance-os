"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkOverdueInvoices } from "./invoices";

export async function getDashboardStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check and update overdue invoices on dashboard load
  await checkOverdueInvoices(userId);

  // Get total clients
  const totalClients = await prisma.client.count({
    where: { userId },
  });

  // Get total projects
  const totalProjects = await prisma.project.count({
    where: { client: { userId } },
  });

  // Get total time entries and calculate total hours
  const timeEntries = await prisma.timeEntry.findMany({
    where: { project: { client: { userId } } },
    select: { duration: true },
  });

  const totalHours = timeEntries.reduce((sum: number, entry: { duration: number | null }) => {
    return sum + (entry.duration || 0);
  }, 0) / 3600; // Convert seconds to hours

  // Get total invoice amount
  const invoices = await prisma.invoice.findMany({
    where: { userId, status: "PAID" },
    select: { totalAmount: true },
  });

  const totalIncome = invoices.reduce((sum: number, invoice: { totalAmount: any }) => {
    return sum + Number(invoice.totalAmount);
  }, 0);

  // Get recent time entries
  const recentTimeEntries = await prisma.timeEntry.findMany({
    where: { project: { client: { userId } } },
    orderBy: { startTime: "desc" },
    take: 5,
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
  });

  // Get recent invoices
  const recentInvoices = await prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      client: true,
    },
  });

  return {
    totalClients,
    totalProjects,
    totalHours: Math.round(totalHours * 100) / 100,
    totalIncome,
    recentTimeEntries,
    recentInvoices,
  };
}
