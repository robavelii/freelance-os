"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "VOID"]).optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export async function getInvoices() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.invoice.findMany({
    where: { userId },
    include: {
      client: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.invoice.findUnique({
    where: { id, userId },
    include: {
      client: true,
      items: true,
    },
  });
}

export async function createInvoice(prevState: any, formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  // Parse the form data
  const data: any = {};
  const items: any[] = [];
  
  formData.forEach((value, key) => {
    if (key.startsWith("items[")) {
      const match = key.match(/items\[(\d+)\]\.(\w+)/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        if (!items[index]) items[index] = {};
        items[index][field] = value;
      }
    } else {
      data[key] = value;
    }
  });

  data.items = items;

  const parsed = invoiceSchema.safeParse(data);

  if (!parsed.success) {
    return { message: "Invalid data", errors: parsed.error.flatten().fieldErrors };
  }

  // Verify client belongs to user
  const client = await prisma.client.findUnique({
    where: { id: parsed.data.clientId, userId },
  });

  if (!client) {
    return { message: "Invalid client" };
  }

  // Calculate total
  const totalAmount = parsed.data.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);

  try {
    await prisma.invoice.create({
      data: {
        userId,
        clientId: parsed.data.clientId,
        invoiceNumber: parsed.data.invoiceNumber,
        status: parsed.data.status || "DRAFT",
        dueDate: new Date(parsed.data.dueDate),
        totalAmount,
        items: {
          create: parsed.data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            amount: item.quantity * item.price,
          })),
        },
      },
    });
    revalidatePath("/invoices");
    return { message: "Invoice created", success: true };
  } catch (e) {
    console.error(e);
    return { message: "Failed to create invoice" };
  }
}

export async function updateInvoiceStatus(id: string, status: string) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  // Verify invoice belongs to user
  const invoice = await prisma.invoice.findUnique({
    where: { id, userId },
  });

  if (!invoice) {
    return { message: "Invoice not found" };
  }

  try {
    await prisma.invoice.update({
      where: { id },
      data: { status: status as any },
    });
    revalidatePath("/invoices");
    return { message: "Invoice status updated", success: true };
  } catch (e) {
    return { message: "Failed to update invoice" };
  }
}

export async function deleteInvoice(id: string) {
  const { userId } = await auth();
  if (!userId) return { message: "Unauthorized" };

  // Verify invoice belongs to user
  const invoice = await prisma.invoice.findUnique({
    where: { id, userId },
  });

  if (!invoice) {
    return { message: "Invoice not found" };
  }

  try {
    await prisma.invoice.delete({
      where: { id },
    });
    revalidatePath("/invoices");
    return { message: "Invoice deleted", success: true };
  } catch (e) {
    return { message: "Failed to delete invoice" };
  }
}
