export async function apiFetch<T>(
  path: string,
  options: Parameters<typeof $fetch<T>>[1] = {}
) {
  const user = await getCurrentUser()

  const token = await user?.getIdToken()

  return $fetch<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  })
}