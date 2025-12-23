'use server'

import { clerkClient } from '@clerk/nextjs/server'

export async function getClerkUsers() {
  const client = await clerkClient()
  const response = await client.users.getUserList()

  return response.data.map(mapUserResponse)
}

export async function deleteClerkUser(userId: string) {
  const client = await clerkClient()
  await client.users.deleteUser(userId)

  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return
  }

  try {
    const response = await fetch(`${baseUrl}/users/${userId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete user from local database")
    }
  } catch (error: any) {
    console.error("Local user delete failed", serializeClerkError(error))
    throw new Error(
      error?.message ||
        "User deleted in Clerk, but failed to remove from local database."
    )
  }
}

export async function createClerkUser(params: {
  firstName?: string
  lastName?: string
  email: string
  password: string
  skipPasswordChecks?: boolean
}) {
  try {
    const client = await clerkClient()
    const user = await client.users.createUser({
      firstName: params.firstName,
      lastName: params.lastName,
      emailAddress: [params.email],
      password: params.password,
      skipPasswordChecks: params.skipPasswordChecks,
      publicMetadata: { role: "STAFF" },
    })

    return mapUserResponse(user)
  } catch (error: any) {
    console.error("Clerk createUser failed", serializeClerkError(error))
    throw new Error(
      error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        "Failed to create user"
    )
  }
}

export async function updateClerkUserRole(userId: string, role: string) {
  try {
    const client = await clerkClient()
    const normalizedRole = role.toUpperCase()
    const user = await client.users.updateUser(userId, {
      publicMetadata: { role: normalizedRole },
    })
    return mapUserResponse(user)
  } catch (error: any) {
    console.error("Clerk updateUser failed", serializeClerkError(error))
    throw new Error(
      error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        "Failed to update user role"
    )
  }
}

export async function inviteClerkUser(params: { email: string; expiresInDays?: number }) {
  try {
    const client = await clerkClient()

    const invitation = await client.invitations.createInvitation({
      emailAddress: params.email,
      expiresInDays: params.expiresInDays,
      notify: true,
    })

    // Return a plain object to keep the server action serializable for client components
    return mapInvitationResponse(invitation)
  } catch (error: any) {
    console.error("Clerk createInvitation failed", serializeClerkError(error))
    throw new Error(
      error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
      error?.message ||
        "Failed to invite user"
    )
  }
}

export async function getClerkInvitations() {
  try {
    const client = await clerkClient()
    const response = await client.invitations.getInvitationList()
    return response.data.map(mapInvitationResponse)
  } catch (error: any) {
    console.error("Clerk getInvitationList failed", serializeClerkError(error))
    throw new Error(
      error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        "Failed to load invitations"
    )
  }
}

export async function revokeClerkInvitation(invitationId: string) {
  try {
    const client = await clerkClient()
    const invitation = await client.invitations.revokeInvitation(invitationId)
    return mapInvitationResponse(invitation)
  } catch (error: any) {
    console.error("Clerk revokeInvitation failed", serializeClerkError(error))
    throw new Error(
      error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        error?.message ||
        "Failed to revoke invitation"
    )
  }
}

function mapUserResponse(user: any) {
  const rawRole = user?.publicMetadata?.role ?? user?.unsafeMetadata?.role
  const normalizedRole =
    typeof rawRole === "string" ? rawRole.toUpperCase() : "STAFF"

  return {
    userId: user.id,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown',
    email: user.emailAddresses?.[0]?.emailAddress || 'No email',
    lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : null,
    lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    role: ["ADMIN", "MANAGER", "STAFF"].includes(normalizedRole) ? normalizedRole : "STAFF",
  }
}

function mapInvitationResponse(invitation: any) {
  return {
    id: invitation.id,
    emailAddress: invitation.emailAddress,
    status: invitation.status,
    createdAt: invitation.createdAt ? new Date(invitation.createdAt).toISOString() : null,
    expiresAt: invitation.expiresAt ? new Date(invitation.expiresAt).toISOString() : null,
  }
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
}

function serializeClerkError(error: any) {
  if (!error) return "Unknown error"
  try {
    return JSON.stringify(error, null, 2)
  } catch (_e) {
    return String(error)
  }
}
