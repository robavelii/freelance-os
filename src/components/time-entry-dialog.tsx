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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTimeEntry } from "@/actions/time-entries"

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

interface TimeEntryDialogProps {
  projects: { id: string; name: string; client: { name: string } }[]
}

export function TimeEntryDialog({ projects }: TimeEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [calculatedDuration, setCalculatedDuration] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      projectId: "",
      description: "",
      startTime: "",
      endTime: "",
    }
  })

  const watchDate = watch("date")
  const watchStartTime = watch("startTime")
  const watchEndTime = watch("endTime")

  // Calculate duration when times change
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

  // Update calculated duration when times change
  useState(() => {
    const duration = calculateDuration(watchDate, watchStartTime, watchEndTime)
    setCalculatedDuration(duration)
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const startDateTime = new Date(`${data.date}T${data.startTime}`)
    const endDateTime = new Date(`${data.date}T${data.endTime}`)

    const result = await createTimeEntry({
      projectId: data.projectId,
      description: data.description,
      startTime: startDateTime,
      endTime: endDateTime,
    })

    if (result.success) {
      setOpen(false)
      reset()
      setCalculatedDuration(null)
      toast.success("Time entry created successfully")
    } else {
      toast.error(result.message || "Failed to create time entry")
    }
  }

  // Recalculate duration when form values change
  const handleTimeChange = () => {
    const duration = calculateDuration(watchDate, watchStartTime, watchEndTime)
    setCalculatedDuration(duration)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Manual Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
          <DialogDescription>
            Manually record time spent on a project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="projectId">Project</Label>
            <Select onValueChange={(value) => setValue("projectId", value)}>
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
            <Input 
              id="date" 
              type="date" 
              {...register("date")} 
              onChange={(e) => {
                register("date").onChange(e)
                handleTimeChange()
              }}
            />
            {errors.date && <span className="text-red-500 text-sm">{errors.date.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input 
                id="startTime" 
                type="time" 
                {...register("startTime")}
                onChange={(e) => {
                  register("startTime").onChange(e)
                  handleTimeChange()
                }}
              />
              {errors.startTime && <span className="text-red-500 text-sm">{errors.startTime.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input 
                id="endTime" 
                type="time" 
                {...register("endTime")}
                onChange={(e) => {
                  register("endTime").onChange(e)
                  handleTimeChange()
                }}
              />
              {errors.endTime && <span className="text-red-500 text-sm">{errors.endTime.message}</span>}
            </div>
          </div>
          {calculatedDuration && (
            <div className="text-center p-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">Duration: </span>
              <span className="font-mono font-bold">{calculatedDuration}</span>
            </div>
          )}
          <DialogFooter>
            <Button type="submit">Save Entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
