"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppShell } from "@/components/layout/app-shell";
import { IncomeChart } from "@/components/dashboard/income-chart";
import { ProjectBreakdown } from "@/components/dashboard/project-breakdown";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { StatCards } from "@/components/dashboard/stat-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayments } from "@/hooks/use-payments";
import {
  getDashboardStats,
  getIncomeByProject,
  getMonthlyIncome,
} from "@/lib/utils/analytics";

export default function DashboardPage() {
  const { payments, loading, error } = usePayments();

  const stats = getDashboardStats(payments);
  const monthlyIncome = getMonthlyIncome(payments);
  const projectBreakdown = getIncomeByProject(payments);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
            <p className="text-sm text-zinc-500">
              Analyze your freelance income across all projects.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28" />
                ))}
              </div>
              <Skeleton className="h-80" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <>
              <StatCards
                totalEarned={stats.totalEarned}
                thisMonth={stats.thisMonth}
                thisYear={stats.thisYear}
                pendingAmount={stats.pendingAmount}
              />
              <div className="grid gap-6 xl:grid-cols-2">
                <IncomeChart data={monthlyIncome} />
                <ProjectBreakdown data={projectBreakdown} />
              </div>
              <RecentPayments payments={payments} />
            </>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
