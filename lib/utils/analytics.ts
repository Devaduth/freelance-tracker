import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import type { Payment, PaymentStatus } from "@/lib/types";

export function sumPaymentsByStatus(
  payments: Payment[],
  status: PaymentStatus
): number {
  return payments
    .filter((payment) => payment.status === status)
    .reduce((total, payment) => total + payment.amount, 0);
}

export function getMonthlyIncome(payments: Payment[], months = 12) {
  const now = new Date();
  const interval = {
    start: startOfMonth(subMonths(now, months - 1)),
    end: endOfMonth(now),
  };

  const paidPayments = payments.filter((payment) => payment.status === "paid");

  return eachMonthOfInterval(interval).map((month) => {
    const key = format(month, "yyyy-MM");
    const label = format(month, "MMM yyyy");
    const total = paidPayments
      .filter((payment) => format(payment.date, "yyyy-MM") === key)
      .reduce((sum, payment) => sum + payment.amount, 0);

    return { month: label, total, key };
  });
}

export function getIncomeByProject(
  payments: Array<Payment & { projectId: string; projectName: string }>
) {
  const paid = payments.filter((payment) => payment.status === "paid");
  const grouped = new Map<string, { name: string; total: number }>();

  for (const payment of paid) {
    const existing = grouped.get(payment.projectId);
    if (existing) {
      existing.total += payment.amount;
    } else {
      grouped.set(payment.projectId, {
        name: payment.projectName,
        total: payment.amount,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
}

export function getDashboardStats(
  payments: Payment[],
  referenceDate = new Date()
) {
  const paid = payments.filter((payment) => payment.status === "paid");
  const pending = payments.filter((payment) => payment.status === "pending");
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  const totalEarned = paid.reduce((sum, payment) => sum + payment.amount, 0);
  const thisMonth = paid
    .filter(
      (payment) =>
        payment.date.getFullYear() === year &&
        payment.date.getMonth() === month
    )
    .reduce((sum, payment) => sum + payment.amount, 0);
  const thisYear = paid
    .filter((payment) => payment.date.getFullYear() === year)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = pending.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  return { totalEarned, thisMonth, thisYear, pendingAmount };
}
