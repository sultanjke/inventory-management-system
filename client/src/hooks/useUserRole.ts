import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

type RoleState = {
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
};

const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

export const useUserRole = (): RoleState => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let isMounted = true;

    const fetchRole = async () => {
      try {
        setIsLoading(true);
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
          throw new Error("Missing API base URL");
        }

        const response = await fetch(`${baseUrl}/users`);
        if (!response.ok) {
          throw new Error("Failed to load user role");
        }

        const data = await response.json();
        const match = data.find((item: any) => item.userId === userId);
        const resolvedRole = (match?.role as UserRole | undefined) ?? null;

        if (isMounted) {
          setRole(resolvedRole);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load user role");
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRole();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, userId]);

  return { role, isLoading, error };
};
