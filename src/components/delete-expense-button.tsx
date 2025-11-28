"use client"

import { deleteExpense } from "@/actions/expenses"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const handleDelete = async () => {
    const result = await deleteExpense(expenseId)
    if (result.success) {
      toast.success("Expense deleted")
    } else {
      toast.error("Failed to delete expense")
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}
