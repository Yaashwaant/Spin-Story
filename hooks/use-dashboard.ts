import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export interface DashboardData {
  user: {
    fullName: string;
    email: string;
    onboarded: boolean;
  };
  stats: {
    totalItems: number;
    recentOutfits: number;
    savedOutfits: number;
  };
  recentItems: Array<{
    id: string;
    name: string;
    imageUrl: string;
    category: string;
    createdAt: Date;
  }>;
  recentOutfits: Array<{
    id: string;
    name: string;
    imageUrl: string;
    occasion: string;
    createdAt: Date;
  }>;
  savedOutfits: Array<{
    id: string;
    name: string;
    imageUrl: string;
    occasion: string;
    createdAt: Date;
  }>;
}

export function useDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const refreshData = async () => {
    await fetchDashboardData();
  };

  return {
    data,
    isLoading,
    error,
    refreshData,
  };
}