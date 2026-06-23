import type { H3Event } from 'h3'

export async function requireUser(event:H3Event) {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'nao-autenticado',
      message: 'É necessário estar autenticado.',
    })
  }

  try {
    return await adminAuth.verifyIdToken(token)
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'token-invalido',
      message: 'A sessão informada é inválida ou expirou.',
    })
  }
}
