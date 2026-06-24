import type { PaymentStatus, ProjectStatus } from "@/lib/types";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "active",
  "completed",
  "paused",
  "archived",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["paid", "pending", "overdue"];

export const CREDENTIAL_TYPES = [
  { value: "api_key", label: "API Key" },
  { value: "login", label: "Login" },
  { value: "password", label: "Password" },
  { value: "env_var", label: "Environment Variable" },
  { value: "note", label: "Note" },
] as const;

export function getStatusBadgeVariant(status: ProjectStatus) {
  switch (status) {
    case "active":
      return "success" as const;
    case "completed":
      return "secondary" as const;
    case "paused":
      return "warning" as const;
    case "archived":
      return "outline" as const;
  }
}

export function getPaymentBadgeVariant(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "overdue":
      return "destructive" as const;
  }
}
