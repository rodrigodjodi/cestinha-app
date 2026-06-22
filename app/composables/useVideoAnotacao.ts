export default function useVideoAnotacao() {
  const tempoVideoMs = useState<number>('tempo-video', () => 0)

  function calcularTempoJogoMs(tempoAtualVideoMs: number, offsetMs: number) {
    return Math.max(0, tempoAtualVideoMs - offsetMs)
  }

  return {
    tempoVideoMs,
    calcularTempoJogoMs,
  }
}
