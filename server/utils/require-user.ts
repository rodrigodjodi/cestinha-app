import type { H3Event } from 'h3'

export async function requireUser(event:H3Event) {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    throw createError({
      statusCode: 401
    })
  }
  const decoded = await adminAuth.verifyIdToken(token)
  return decoded
}
