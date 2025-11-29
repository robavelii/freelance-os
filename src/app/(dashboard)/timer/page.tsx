import { getProjects } from "@/actions/projects";
import { getTimeEntries } from "@/actions/time-entries";
import { Timer } from "@/components/timer";
import { TimeEntryDialog } from "@/components/time-entry-dialog";
import { TimeEntryCard } from "@/components/time-entry-card";
import { format, isToday, isYesterday, startOfDay } from "date-fns";

type TimeEntryWithProject = Awaited<ReturnType<typeof getTimeEntries>>[number];

interface GroupedEntries {
  date: Date;
  dateLabel: string;
  entries: TimeEntryWithProject[];
  totalDuration: number;
}

function groupEntriesByDate(entries: TimeEntryWithProject[]): GroupedEntries[] {
  const groups = new Map<string, GroupedEntries>();

  for (const entry of entries) {
    const dateKey = format(entry.startTime, "yyyy-MM-dd");
    const date = startOfDay(entry.startTime);

    if (!groups.has(dateKey)) {
      let dateLabel: string;
      if (isToday(date)) {
        dateLabel = "Today";
      } else if (isYesterday(date)) {
        dateLabel = "Yesterday";
      } else {
        dateLabel = format(date, "EEEE, MMMM d, yyyy");
      }

      groups.set(dateKey, {
        date,
        dateLabel,
        entries: [],
        totalDuration: 0,
      });
    }

    const group = groups.get(dateKey)!;
    group.entries.push(entry);
    group.totalDuration += entry.duration || 0;
  }

  // Sort groups by date descending (most recent first)
  return Array.from(groups.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}


export default async function TimerPage() {
  const projects = await getProjects();
  const timeEntries = await getTimeEntries();
  const groupedEntries = groupEntriesByDate(timeEntries);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Time Tracking</h1>
        <TimeEntryDialog projects={projects} />
      </div>
      
      <Timer projects={projects} />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Time Entries</h2>
        
        {groupedEntries.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No time entries yet. Start the timer above!
          </div>
        ) : (
          groupedEntries.map((group) => (
            <div key={group.dateLabel} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{group.dateLabel}</h3>
                <span className="text-sm font-mono font-semibold bg-muted px-2 py-1 rounded">
                  Total: {formatDuration(group.totalDuration)}
                </span>
              </div>
              <div className="grid gap-3">
                {group.entries.map((entry) => (
                  <TimeEntryCard key={entry.id} entry={entry} projects={projects} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
