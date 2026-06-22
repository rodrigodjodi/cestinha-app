declare module 'youtube-player' {
  export type YoutubePlayerInstance = {
    getCurrentTime: () => Promise<number>
    pauseVideo: () => Promise<void>
    seekTo: (
      segundos: number,
      permitirBuscaAdiante?: boolean
    ) => Promise<void>
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
