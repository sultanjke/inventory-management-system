import { useUser } from "@clerk/nextjs";

export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

type RoleState = {
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
};

export const useUserRole = (): RoleState => {
  const { user, isLoaded, isSignedIn } = useUser();
  const rawRole = user?.publicMetadata?.role ?? user?.unsafeMetadata?.role;
  const normalizedRole =
    typeof rawRole === "string" ? rawRole.toUpperCase() : "STAFF";
  const resolvedRole = isSignedIn
    ? (["ADMIN", "MANAGER", "STAFF"].includes(normalizedRole)
        ? (normalizedRole as UserRole)
        : "STAFF")
    : null;

  return {
    role: isLoaded ? resolvedRole : null,
    isLoading: !isLoaded,
    error: null,
  };
};
