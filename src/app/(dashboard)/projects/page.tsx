import { getProjects } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { ProjectDialog } from "@/components/project-dialog";
import { EditProjectDialog } from "@/components/edit-project-dialog";
import { ProjectStatusFilter } from "@/components/project-status-filter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500",
  COMPLETED: "bg-blue-500/10 text-blue-500",
  ARCHIVED: "bg-gray-500/10 text-gray-500",
};

export default async function ProjectsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const allProjects = await getProjects();
  const clients = await getClients();

  // Filter projects by status
  const projects = status
    ? allProjects.filter((p) => p.status === status)
    : allProjects;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <ProjectDialog clients={clients} />
      </div>

      <ProjectStatusFilter />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {project.name}
                  <Badge variant="secondary" className={statusColors[project.status]}>
                    {project.status.toLowerCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>{project.client.name}</CardDescription>
              </div>
              <EditProjectDialog project={project} clients={clients} />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Updated {formatDistanceToNow(project.updatedAt)} ago</p>
                {project.hourlyRate && <p className="mt-1">Rate: ${Number(project.hourlyRate)}/hr</p>}
              </div>
              <div className="mt-4">
                <span className="text-sm font-bold">{project._count.timeEntries}</span>
                <span className="text-xs text-muted-foreground ml-1">Time Entries</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No projects found. Create one to start tracking time.
          </div>
        )}
      </div>
    </div>
  );
}
