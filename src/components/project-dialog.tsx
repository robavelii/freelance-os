"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
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
import { createProject } from "@/actions/projects"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  clientId: z.string().min(1, "Client is required"),
  hourlyRate: z.string().optional(),
})

interface ProjectDialogProps {
    clients: { id: string; name: string }[]
}

export function ProjectDialog({ clients }: ProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("clientId", data.clientId)
    if (data.hourlyRate) formData.append("hourlyRate", data.hourlyRate)

    const result = await createProject(null, formData)
    if (result.success) {
      setOpen(false)
      reset()
      toast.success("Project created successfully")
    } else {
        toast.error("Failed to create project")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Create a new project for a client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
            <Input id="hourlyRate" type="number" {...register("hourlyRate")} />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
