"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const statuses = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "VIEWED", label: "Viewed" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "VOID", label: "Void" },
]

export function InvoiceStatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get("status") || "ALL"

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "ALL") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    router.push(`/invoices?${params.toString()}`)
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
