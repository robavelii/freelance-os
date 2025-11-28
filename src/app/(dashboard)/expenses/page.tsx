import { getExpenses } from "@/actions/expenses";
import { ExpenseDialog } from "@/components/expense-dialog";
import { DeleteExpenseButton } from "@/components/delete-expense-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  const totalExpenses = expenses.reduce((sum: number, expense: { amount: any }) => {
    return sum + Number(expense.amount);
  }, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
        <ExpenseDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {expenses.map((expense: any) => (
          <Card key={expense.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex flex-col gap-1">
                <span className="font-medium">{expense.description}</span>
                <span className="text-sm text-muted-foreground">
                  {format(expense.date, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">${Number(expense.amount).toFixed(2)}</span>
                <DeleteExpenseButton expenseId={expense.id} />
              </div>
            </CardContent>
          </Card>
        ))}
        {expenses.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No expenses recorded yet. Add one to start tracking.
          </div>
        )}
      </div>
    </div>
  );
}
