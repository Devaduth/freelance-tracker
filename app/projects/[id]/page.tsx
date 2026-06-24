"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { AmountHistory } from "@/components/projects/amount-history";
import { CredentialList } from "@/components/projects/credential-list";
import { PaymentList } from "@/components/projects/payment-list";
import { UpdateAmountDialog } from "@/components/projects/update-amount-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/components/auth/auth-provider";
import {
  deleteProject,
  getAmountHistory,
  getCredentials,
  getPayments,
  getProject,
} from "@/lib/firebase/firestore";
import { getStatusBadgeVariant } from "@/lib/utils/constants";
import { sumPaymentsByStatus } from "@/lib/utils/analytics";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type {
  AmountHistoryEntry,
  Credential,
  Payment,
  Project,
} from "@/lib/types";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthContext();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [amountHistory, setAmountHistory] = useState<AmountHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProjectData() {
    if (!user || !projectId) return;
    setLoading(true);
    setError(null);

    try {
      const [projectData, paymentData, credentialData, historyData] =
        await Promise.all([
          getProject(user.uid, projectId),
          getPayments(user.uid, projectId),
          getCredentials(user.uid, projectId),
          getAmountHistory(user.uid, projectId),
        ]);

      if (!projectData) {
        setError("Project not found");
        return;
      }

      setProject(projectData);
      setPayments(paymentData);
      setCredentials(credentialData);
      setAmountHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user || !projectId) {
      setLoading(false);
      return;
    }

    const uid = user.uid;

    let cancelled = false;

    async function loadProjectDataEffect() {
      setLoading(true);
      setError(null);

      try {
        const [projectData, paymentData, credentialData, historyData] =
          await Promise.all([
            getProject(uid, projectId),
            getPayments(uid, projectId),
            getCredentials(uid, projectId),
            getAmountHistory(uid, projectId),
          ]);

        if (cancelled) return;

        if (!projectData) {
          setError("Project not found");
          return;
        }

        setProject(projectData);
        setPayments(paymentData);
        setCredentials(credentialData);
        setAmountHistory(historyData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load project");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProjectDataEffect();

    return () => {
      cancelled = true;
    };
  }, [user, projectId]);

  async function handleDelete() {
    if (!user || !project) return;
    if (!confirm(`Delete "${project.name}" and all related data?`)) return;

    setDeleting(true);
    try {
      await deleteProject(user.uid, project.id);
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      setDeleting(false);
    }
  }

  const totalPaid = sumPaymentsByStatus(payments, "paid");
  const pendingAmount = sumPaymentsByStatus(payments, "pending");
  const remainingBalance =
    project?.amount != null ? project.amount - totalPaid : null;

  return (
    <ProtectedRoute>
      <AppShell>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : error || !project ? (
          <p className="text-sm text-red-600">{error ?? "Project not found"}</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Button variant="ghost" asChild className="px-0">
                  <Link href="/projects">
                    <ArrowLeft className="h-4 w-4" />
                    Back to projects
                  </Link>
                </Button>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-zinc-900">
                    {project.name}
                  </h1>
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-500">{project.client}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/projects/${project.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="credentials">Credentials</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                          Current amount
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">
                          {project.amount != null
                            ? formatCurrency(project.amount, project.currency)
                            : "—"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                          Total paid
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold text-emerald-700">
                          {formatCurrency(totalPaid, project.currency)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                          Pending
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold text-amber-700">
                          {formatCurrency(pendingAmount, project.currency)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">
                          Remaining
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">
                          {remainingBalance != null
                            ? formatCurrency(remainingBalance, project.currency)
                            : "—"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Project amount</CardTitle>
                      <UpdateAmountDialog
                        projectId={project.id}
                        currentAmount={project.amount}
                        onUpdated={loadProjectData}
                      />
                    </CardHeader>
                    <CardContent>
                      <AmountHistory
                        entries={amountHistory}
                        currency={project.currency}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-zinc-500">Description</p>
                        <p>{project.description || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Currency</p>
                        <p>{project.currency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Start date</p>
                        <p>
                          {project.startDate
                            ? formatDate(project.startDate)
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">End date</p>
                        <p>
                          {project.endDate ? formatDate(project.endDate) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Payments</p>
                        <p>{payments.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="credentials">
                <CredentialList
                  projectId={project.id}
                  credentials={credentials}
                  onChanged={loadProjectData}
                />
              </TabsContent>

              <TabsContent value="payments">
                <PaymentList
                  projectId={project.id}
                  currency={project.currency}
                  payments={payments}
                  onChanged={loadProjectData}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
