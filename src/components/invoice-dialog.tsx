"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createInvoice } from "@/actions/invoices"

const formSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.string().min(1, "Quantity is required"),
    price: z.string().min(1, "Price is required"),
  })).min(1, "At least one item is required"),
})

interface InvoiceDialogProps {
  clients: { id: string; name: string }[]
}

export function InvoiceDialog({ clients }: InvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ description: "", quantity: "1", price: "" }],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: register as any,
    name: "items",
  })

  const items = watch("items")

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const price = parseFloat(item.price) || 0
      return sum + (quantity * price)
    }, 0).toFixed(2)
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append("clientId", data.clientId)
    formData.append("invoiceNumber", data.invoiceNumber)
    formData.append("dueDate", data.dueDate)
    
    data.items.forEach((item, index) => {
      formData.append(`items[${index}].description`, item.description)
      formData.append(`items[${index}].quantity`, item.quantity)
      formData.append(`items[${index}].price`, item.price)
    })

    const result = await createInvoice(null, formData)
    if (result.success) {
      setOpen(false)
      reset()
      toast.success("Invoice created successfully")
    } else {
      toast.error(result.message || "Failed to create invoice")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            <Select onValueChange={(value) => setValue("clientId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <span className="text-red-500 text-sm">{errors.clientId.message}</span>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" {...register("invoiceNumber")} placeholder="INV-001" />
              {errors.invoiceNumber && <span className="text-red-500 text-sm">{errors.invoiceNumber.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && <span className="text-red-500 text-sm">{errors.dueDate.message}</span>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", quantity: "1", price: "" })}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            {items.map((field, index) => (
              <div key={index} className="grid gap-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <Input
                  {...register(`items.${index}.description` as const)}
                  placeholder="Description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    {...register(`items.${index}.quantity` as const)}
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                  />
                  <Input
                    {...register(`items.${index}.price` as const)}
                    type="number"
                    step="0.01"
                    placeholder="Price"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-semibold">Total:</span>
            <span className="text-2xl font-bold">${calculateTotal()}</span>
          </div>

          <DialogFooter>
            <Button type="submit">Create Invoice</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
