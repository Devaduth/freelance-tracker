"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  createPayment,
  deletePayment,
  updatePayment,
} from "@/lib/firebase/firestore";
import { useAuthContext } from "@/components/auth/auth-provider";
import { PAYMENT_STATUSES, getPaymentBadgeVariant } from "@/lib/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Payment, PaymentInput } from "@/lib/types";

interface PaymentListProps {
  projectId: string;
  currency: string;
  payments: Payment[];
  onChanged: () => void;
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function PaymentFormDialog({
  projectId,
  currency,
  payment,
  onSaved,
  trigger,
}: {
  projectId: string;
  currency: string;
  payment?: Payment;
  onSaved: () => void;
  trigger: React.ReactElement<{ onClick?: () => void }>;
}) {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<PaymentInput>(
    payment
      ? {
          amount: payment.amount,
          currency: payment.currency,
          date: payment.date,
          status: payment.status,
          invoiceNumber: payment.invoiceNumber ?? "",
          description: payment.description ?? "",
          paymentMethod: payment.paymentMethod ?? "",
        }
      : {
          amount: 0,
          currency,
          date: new Date(),
          status: "pending",
          invoiceNumber: "",
          description: "",
          paymentMethod: "",
        }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      if (payment) {
        await updatePayment(user.uid, projectId, payment.id, values);
      } else {
        await createPayment(user.uid, projectId, values);
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? "Edit payment" : "Add payment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={values.amount}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    amount: Number(event.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-date">Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={toDateInput(values.date)}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    date: new Date(event.target.value),
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-status">Status</Label>
              <Select
                id="payment-status"
                value={values.status}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    status: event.target.value as PaymentInput["status"],
                  }))
                }
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment method</Label>
              <Input
                id="payment-method"
                value={values.paymentMethod ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    paymentMethod: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Invoice number</Label>
            <Input
              id="invoice-number"
              value={values.invoiceNumber ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  invoiceNumber: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-description">Description</Label>
            <Textarea
              id="payment-description"
              value={values.description ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentList({
  projectId,
  currency,
  payments,
  onChanged,
}: PaymentListProps) {
  const { user } = useAuthContext();

  async function handleDelete(paymentId: string) {
    if (!user) return;
    if (!confirm("Delete this payment?")) return;
    await deletePayment(user.uid, projectId, paymentId);
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PaymentFormDialog
          projectId={projectId}
          currency={currency}
          onSaved={onChanged}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              Add payment
            </Button>
          }
        />
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-zinc-500">No payments recorded yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(payment.date)}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(payment.amount, payment.currency)}
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentBadgeVariant(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{payment.invoiceNumber || "—"}</TableCell>
                <TableCell>{payment.description || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <PaymentFormDialog
                      projectId={projectId}
                      currency={currency}
                      payment={payment}
                      onSaved={onChanged}
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(payment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
