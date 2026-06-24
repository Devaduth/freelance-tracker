"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getProjects } from "@/lib/firebase/firestore";
import type { Project } from "@/lib/types";

export function useProjects() {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects(user.uid);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
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

    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProjects(uid);
        if (!cancelled) setProjects(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load projects"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { projects, loading, error, refresh };
}
