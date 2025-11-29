"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

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
import { updateTimeEntry, deleteTimeEntry } from "@/actions/time-entries"

const formSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).refine((data) => {
  const start = new Date(`${data.date}T${data.startTime}`)
  const end = new Date(`${data.date}T${data.endTime}`)
  return end > start
}, {
  message: "End time must be after start time",
  path: ["endTime"],
})

interface TimeEntry {
  id: string
  projectId: string
  description: string | null
  startTime: Date
  endTime: Date | null
  duration: number | null
}

interface EditTimeEntryDialogProps {
  entry: TimeEntry
  projects: { id: string; name: string; client: { name: string } }[]
}


export function EditTimeEntryDialog({ entry, projects }: EditTimeEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [calculatedDuration, setCalculatedDuration] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: entry.projectId,
      description: entry.description || "",
      date: format(entry.startTime, "yyyy-MM-dd"),
      startTime: format(entry.startTime, "HH:mm"),
      endTime: entry.endTime ? format(entry.endTime, "HH:mm") : "",
    }
  })

  const watchDate = watch("date")
  const watchStartTime = watch("startTime")
  const watchEndTime = watch("endTime")

  const calculateDuration = (date: string, startTime: string, endTime: string): string | null => {
    if (!date || !startTime || !endTime) return null
    const start = new Date(`${date}T${startTime}`)
    const end = new Date(`${date}T${endTime}`)
    if (end <= start) return null
    const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)
    const h = Math.floor(durationSeconds / 3600)
    const m = Math.floor((durationSeconds % 3600) / 60)
    const s = durationSeconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const duration = calculateDuration(watchDate, watchStartTime, watchEndTime)
    setCalculatedDuration(duration)
  }, [watchDate, watchStartTime, watchEndTime])

  // Reset form when entry changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        projectId: entry.projectId,
        description: entry.description || "",
        date: format(entry.startTime, "yyyy-MM-dd"),
        startTime: format(entry.startTime, "HH:mm"),
        endTime: entry.endTime ? format(entry.endTime, "HH:mm") : "",
      })
    }
  }, [open, entry, reset])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const startDateTime = new Date(`${data.date}T${data.startTime}`)
    const endDateTime = new Date(`${data.date}T${data.endTime}`)

    const result = await updateTimeEntry({
      id: entry.id,
      projectId: data.projectId,
      description: data.description,
      startTime: startDateTime,
      endTime: endDateTime,
    })

    if (result.success) {
      setOpen(false)
      toast.success("Time entry updated successfully")
    } else {
      toast.error(result.message || "Failed to update time entry")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTimeEntry(entry.id)
    setIsDeleting(false)

    if (result.success) {
      setOpen(false)
      toast.success("Time entry deleted")
    } else {
      toast.error(result.message || "Failed to delete time entry")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
          <DialogDescription>
            Update the details of this time entry.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="projectId">Project</Label>
            <Select 
              defaultValue={entry.projectId}
              onValueChange={(value) => setValue("projectId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} ({p.client.name})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && <span className="text-red-500 text-sm">{errors.projectId.message}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} placeholder="What did you work on?" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <span className="text-red-500 text-sm">{errors.date.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="time" {...register("startTime")} />
              {errors.startTime && <span className="text-red-500 text-sm">{errors.startTime.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="time" {...register("endTime")} />
              {errors.endTime && <span className="text-red-500 text-sm">{errors.endTime.message}</span>}
            </div>
          </div>
          {calculatedDuration && (
            <div className="text-center p-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">Duration: </span>
              <span className="font-mono font-bold">{calculatedDuration}</span>
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
