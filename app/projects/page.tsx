"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/use-projects";
import { usePayments } from "@/hooks/use-payments";
import { PROJECT_STATUSES } from "@/lib/utils/constants";
import type { ProjectStatus } from "@/lib/types";

export default function ProjectsPage() {
  const { projects, loading, error } = useProjects();
  const { payments } = usePayments();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );

  const paymentTotalsByProject = useMemo(() => {
    const map = new Map<string, { paid: number; pending: number }>();
    for (const payment of payments) {
      const current = map.get(payment.projectId) ?? { paid: 0, pending: 0 };
      if (payment.status === "paid") {
        current.paid += payment.amount;
      } else if (payment.status === "pending") {
        current.pending += payment.amount;
      }
      map.set(payment.projectId, current);
    }
    return map;
  }, [payments]);

  const filteredProjects = projects.filter((project) => {
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      project.name.toLowerCase().includes(query) ||
      project.client.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">Projects</h1>
              <p className="text-sm text-zinc-500">
                Manage your freelance projects and track earnings.
              </p>
            </div>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4" />
                New project
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                className="pl-9"
                placeholder="Search by project or client..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select
              className="sm:w-48"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ProjectStatus | "all")
              }
            >
              <option value="all">All statuses</option>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-48" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
              <p className="text-zinc-600">No projects found.</p>
              <Button asChild className="mt-4">
                <Link href="/projects/new">Create your first project</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => {
                const totals = paymentTotalsByProject.get(project.id);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    totalPaid={totals?.paid ?? 0}
                    pendingAmount={totals?.pending ?? 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
