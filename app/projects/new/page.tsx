"use client";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectForm } from "@/components/projects/project-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProject } from "@/lib/firebase/firestore";
import { useAuthContext } from "@/components/auth/auth-provider";
import type { ProjectInput } from "@/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  async function handleSubmit(values: ProjectInput, initialAmount?: number) {
    if (!user) return;
    const projectId = await createProject(user.uid, values, initialAmount);
    router.push(`/projects/${projectId}`);
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              New project
            </h1>
            <p className="text-sm text-zinc-500">
              Add a freelance project and optionally set an initial amount.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Project details</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectForm
                showAmountField
                submitLabel="Create project"
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
