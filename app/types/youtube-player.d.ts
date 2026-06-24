declare module 'youtube-player' {
  export type YoutubePlayerInstance = {
    getCurrentTime: () => Promise<number>
    getPlaybackRate: () => Promise<number>
    getAvailablePlaybackRates: () => Promise<number[]>
    pauseVideo: () => Promise<void>
    seekTo: (
      segundos: number,
      permitirBuscaAdiante?: boolean
    ) => Promise<void>
    setPlaybackRate: (velocidade: number) => Promise<void>
    on: (
      evento: 'ready' | 'playbackRateChange',
      callback: (event: { data: number }) => void
    ) => void
  }

  type YoutubePlayerOptions = {
    videoId?: string
    playerVars?: {
      rel?: number
    }
  }

  export default function YoutubePlayer(
    elemento: HTMLElement,
    opcoes?: YoutubePlayerOptions
  ): YoutubePlayerInstance
}
