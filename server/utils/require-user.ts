import { H3Event } from "#imports"
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