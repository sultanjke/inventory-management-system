'use server'

import { clerkClient } from '@clerk/nextjs/server'

export async function getClerkUsers() {
  const client = await clerkClient()
  const response = await client.users.getUserList()

  return response.data.map(user => ({
    userId: user.id,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown',
    email: user.emailAddresses[0]?.emailAddress || 'No email',
    lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : null,
    lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  }))
}

export async function deleteClerkUser(userId: string) {
  const client = await clerkClient()
  await client.users.deleteUser(userId)
}
