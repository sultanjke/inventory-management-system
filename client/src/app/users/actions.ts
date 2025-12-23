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
  return {
    userId: user.id,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown',
    email: user.emailAddresses?.[0]?.emailAddress || 'No email',
    lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : null,
    lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
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

function serializeClerkError(error: any) {
  if (!error) return "Unknown error"
  try {
    return JSON.stringify(error, null, 2)
  } catch (_e) {
    return String(error)
  }
}
