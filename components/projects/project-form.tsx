"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_STATUSES } from "@/lib/utils/constants";
import type { ProjectInput } from "@/lib/types";

interface ProjectFormProps {
  initialValues?: Partial<ProjectInput>;
  submitLabel?: string;
  onSubmit: (values: ProjectInput, initialAmount?: number) => Promise<void>;
  showAmountField?: boolean;
}

const defaultValues: ProjectInput = {
  name: "",
  client: "",
  description: "",
  status: "active",
  currency: "INR",
};

export function ProjectForm({
  initialValues,
  submitLabel = "Save project",
  onSubmit,
  showAmountField = false,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectInput>({
    ...defaultValues,
    ...initialValues,
  });
  const [amount, setAmount] = useState(
    initialValues?.amount != null ? String(initialValues.amount) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const parsedAmount = amount ? Number(amount) : undefined;
      await onSubmit(values, parsedAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Project name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Input
            id="client"
            value={values.client}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                client: event.target.value,
              }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description ?? ""}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as ProjectInput["status"],
              }))
            }
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={values.currency}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                currency: event.target.value.toUpperCase(),
              }))
            }
            required
          />
        </div>
        {showAmountField && (
          <div className="space-y-2">
            <Label htmlFor="amount">Initial amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Optional"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            type="date"
            value={
              values.startDate
                ? values.startDate.toISOString().slice(0, 10)
                : ""
            }
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                startDate: event.target.value
                  ? new Date(event.target.value)
                  : undefined,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            type="date"
            value={
              values.endDate ? values.endDate.toISOString().slice(0, 10) : ""
            }
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                endDate: event.target.value
                  ? new Date(event.target.value)
                  : undefined,
              }))
            }
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
