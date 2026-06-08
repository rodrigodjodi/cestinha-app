
type BeepType =
  | 'sine'
  | 'square'
  | 'sawtooth'
  | 'triangle'

const audioCtx = new AudioContext()

export async function initAudio() {
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume()
  }
}

export function beep({
  frequency = 440,
  duration = 120,
  volume = 0.05,
  type = 'sine'
}: {
  frequency?: number
  duration?: number
  volume?: number
  type?: BeepType
} = {}) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = type
  osc.frequency.value = frequency

  // evita click/pop
  gain.gain.setValueAtTime(
    0,
    audioCtx.currentTime
  )

  gain.gain.linearRampToValueAtTime(
    volume,
    audioCtx.currentTime + 0.01
  )

  gain.gain.linearRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration / 1000
  )

  osc.connect(gain)
  gain.connect(audioCtx.destination)

  osc.start()
  osc.stop(audioCtx.currentTime + duration / 1000)
}
export function multiBeep({
  count = 3,
  interval = 160,
  ...beepOptions
}: {
  count?: number
  interval?: number
  frequency?: number
  duration?: number
  volume?: number
  type?: BeepType
}) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      beep(beepOptions)
    }, i * interval)
  }
}