export function formatarSegundosPlacar(totalSegundos: number) {
  const segundosNormalizados = Math.max(0, Math.floor(totalSegundos))
  const minutos = Math.floor(segundosNormalizados / 60)
  const segundos = segundosNormalizados % 60

  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

export function formatarTempoRestantePlacar(
  duracaoSegundos: number,
  tempoDecorridoMs: number
) {
  const tempoDecorridoSegundos = Math.floor(tempoDecorridoMs / 1000)
  const tempoRestanteSegundos = duracaoSegundos - tempoDecorridoSegundos

  return formatarSegundosPlacar(tempoRestanteSegundos)
}
