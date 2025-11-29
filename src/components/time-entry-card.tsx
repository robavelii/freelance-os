"use client"

import { Card, CardContent } from "@/components/ui/card"
import { EditTimeEntryDialog } from "@/components/edit-time-entry-dialog"
import { format } from "date-fns"

interface TimeEntry {
  id: string
  projectId: string
  description: string | null
  startTime: Date
  endTime: Date | null
  duration: number | null
  project: {
    name: string
    client: {
      name: string
    }
  }
}

interface TimeEntryCardProps {
  entry: TimeEntry
  projects: { id: string; name: string; client: { name: string } }[]
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function TimeEntryCard({ entry, projects }: TimeEntryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{entry.description || "No description"}</span>
          <span className="text-sm text-muted-foreground">
            {entry.project.name} • {entry.project.client.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <span className="font-mono font-bold">
              {entry.duration ? formatDuration(entry.duration) : "00:00:00"}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(entry.startTime, "h:mm a")} - {entry.endTime ? format(entry.endTime, "h:mm a") : "Now"}
            </span>
          </div>
          <EditTimeEntryDialog entry={entry} projects={projects} />
        </div>
      </CardContent>
    </Card>
  )
}
