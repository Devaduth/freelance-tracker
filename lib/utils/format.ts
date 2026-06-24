import { format, formatDistanceToNow } from "date-fns";

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatDateTime(date: Date): string {
  return format(date, "MMM d, yyyy h:mm a");
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMM yyyy");
}
