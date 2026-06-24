"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getAllPaymentsForUser } from "@/lib/firebase/firestore";
import type { PaymentWithProject } from "@/lib/types";

export function usePayments() {
  const { user } = useAuthContext();
  const [payments, setPayments] = useState<PaymentWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPaymentsForUser(user.uid);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;

    let cancelled = false;

    async function loadPayments() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPaymentsForUser(uid);
        if (!cancelled) setPayments(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load payments"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPayments();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { payments, loading, error, refresh };
}
