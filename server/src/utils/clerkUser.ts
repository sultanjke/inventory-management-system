import { UserRole } from "@prisma/client";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "user_35qmxNpKsfBsVNtDiNo4DVHiKcz";

export function getDefaultRole(userId: string): UserRole {
  return userId === ADMIN_USER_ID ? "ADMIN" : "STAFF";
}

export function getPrimaryEmail(user: any): string | null {
  const primaryId = user?.primary_email_address_id || user?.primaryEmailAddressId;
  const addresses = user?.email_addresses || user?.emailAddresses || [];
  const primary =
    addresses.find((address: any) => address.id === primaryId) || addresses[0];
  return primary?.email_address || primary?.emailAddress || null;
}

export function mapClerkUser(user: any) {
  const firstName = user?.first_name || user?.firstName || null;
  const lastName = user?.last_name || user?.lastName || null;
  const name =
    user?.full_name ||
    user?.fullName ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    null;

  const createdAtValue = user?.created_at || user?.createdAt;
  const lastSignInValue = user?.last_sign_in_at || user?.lastSignInAt;

  return {
    email: getPrimaryEmail(user),
    firstName,
    lastName,
    name,
    imageUrl: user?.image_url || user?.imageUrl || null,
    lastSignInAt: lastSignInValue ? new Date(lastSignInValue) : null,
    createdAt: createdAtValue ? new Date(createdAtValue) : undefined,
  };
}
