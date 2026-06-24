"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { AmountHistoryEntry } from "@/lib/types";

interface AmountHistoryProps {
  entries: AmountHistoryEntry[];
  currency: string;
}

export function AmountHistory({ entries, currency }: AmountHistoryProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No amount history yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Effective date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Recorded</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{formatDate(entry.effectiveDate)}</TableCell>
            <TableCell className="font-medium">
              {formatCurrency(entry.amount, currency)}
            </TableCell>
            <TableCell>{entry.note ?? "—"}</TableCell>
            <TableCell className="text-zinc-500">
              {formatDate(entry.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
