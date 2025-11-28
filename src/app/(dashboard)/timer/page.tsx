import { getProjects } from "@/actions/projects";
import { getTimeEntries } from "@/actions/time-entries";
import { Timer } from "@/components/timer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";

export default async function TimerPage() {
  const projects = await getProjects();
  const timeEntries = await getTimeEntries();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Time Tracking</h1>
      
      <Timer projects={projects} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        <div className="grid gap-4">
            {timeEntries.map(entry => (
                <Card key={entry.id}>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-medium">{entry.description || "No description"}</span>
                            <span className="text-sm text-muted-foreground">
                                {entry.project.name} • {entry.project.client.name}
                            </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="font-mono font-bold">
                                {entry.duration ? new Date(entry.duration * 1000).toISOString().substr(11, 8) : "00:00:00"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {format(entry.startTime, "MMM d, h:mm a")} - {entry.endTime ? format(entry.endTime, "h:mm a") : "Now"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {timeEntries.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No time entries yet. Start the timer above!
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
