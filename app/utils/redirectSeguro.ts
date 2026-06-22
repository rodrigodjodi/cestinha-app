export function redirectSeguro(valor: unknown): string {
  if (
    typeof valor === 'string'
    && valor.startsWith('/')
    && !valor.startsWith('//')
  ) {
    return valor
  }

  return '/painel'
}
