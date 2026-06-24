"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectAmount } from "@/lib/firebase/firestore";
import { useAuthContext } from "@/components/auth/auth-provider";

interface UpdateAmountDialogProps {
  projectId: string;
  currentAmount?: number;
  onUpdated: () => void;
}

export function UpdateAmountDialog({
  projectId,
  currentAmount,
  onUpdated,
}: UpdateAmountDialogProps) {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(
    currentAmount != null ? String(currentAmount) : ""
  );
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await updateProjectAmount(user.uid, projectId, {
        amount: Number(amount),
        effectiveDate: new Date(effectiveDate),
        note: note || undefined,
      });
      setOpen(false);
      setNote("");
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update amount");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update amount</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update project amount</DialogTitle>
          <DialogDescription>
            Record a new agreed amount and when it takes effect.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-amount">Amount</Label>
            <Input
              id="update-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effective-date">Effective date</Label>
            <Input
              id="effective-date"
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount-note">Note</Label>
            <Textarea
              id="amount-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Scope increase"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save amount"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
