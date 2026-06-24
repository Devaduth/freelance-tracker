import { Timestamp } from "firebase/firestore";

export type ProjectStatus = "active" | "completed" | "paused" | "archived";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type CredentialType =
  | "api_key"
  | "login"
  | "password"
  | "env_var"
  | "note";

export interface Project {
  id: string;
  name: string;
  client: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  currency: string;
  amount?: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AmountHistoryEntry {
  id: string;
  amount: number;
  effectiveDate: Date;
  note?: string;
  createdAt: Date;
}

export interface Credential {
  id: string;
  label: string;
  type: CredentialType;
  username?: string;
  secret: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  status: PaymentStatus;
  invoiceNumber?: string;
  description?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWithProject extends Payment {
  projectId: string;
  projectName: string;
}

export type ProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;

export type CredentialInput = Omit<
  Credential,
  "id" | "createdAt" | "updatedAt"
>;

export type PaymentInput = Omit<
  Payment,
  "id" | "createdAt" | "updatedAt"
>;

export type AmountHistoryInput = Omit<
  AmountHistoryEntry,
  "id" | "createdAt"
>;

export function timestampToDate(value: Timestamp | Date | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return value.toDate();
}
