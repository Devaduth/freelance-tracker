"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectForm } from "@/components/projects/project-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getProject, updateProject } from "@/lib/firebase/firestore";
import type { Project, ProjectInput } from "@/lib/types";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthContext();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getProject(user.uid, params.id);
        setProject(data);
        if (!data) setError("Project not found");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [user, params.id]);

  async function handleSubmit(values: ProjectInput) {
    if (!user || !project) return;
    await updateProject(user.uid, project.id, values);
    router.push(`/projects/${project.id}`);
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-6">
          <Button variant="ghost" asChild className="px-0">
            <Link href={`/projects/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to project
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Edit project
            </h1>
            <p className="text-sm text-zinc-500">
              Update project details. Use the overview tab to change amount.
            </p>
          </div>

          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : error || !project ? (
            <p className="text-sm text-red-600">{error ?? "Project not found"}</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Project details</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectForm
                  initialValues={project}
                  submitLabel="Save changes"
                  onSubmit={handleSubmit}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
