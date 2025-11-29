import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCSV, clientColumns } from "@/lib/export/csv";

/**
 * GET /api/export/clients
 * 
 * Exports all clients for the authenticated user as CSV
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

    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const data = clients.map((client: { name: string; email: string | null; company: string | null; address: string | null; createdAt: Date }) => ({
      name: client.name,
      email: client.email || "",
      company: client.company || "",
      address: client.address || "",
      createdAt: client.createdAt.toISOString(),
    }));

    const csv = generateCSV({ data, columns: clientColumns });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Client export error:", error);
    return NextResponse.json(
      { error: "Failed to export clients" },
      { status: 500 }
    );
  }
}
