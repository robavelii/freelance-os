import { getProjects } from "@/actions/projects";
import { getClients } from "@/actions/clients";
import { ProjectDialog } from "@/components/project-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const clients = await getClients();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <ProjectDialog clients={clients} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.client.name}</CardDescription>
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
