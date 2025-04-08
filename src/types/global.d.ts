declare global {
  interface Window {
    Telegram: {
      WebApp: {
        openLink: (url: string) => void
        openTelegramLink: (url: string) => void
        sendData: (data: string) => void
        expand: () => void
        close: () => void
        initDataUnsafe: any
        [key: string]: any
      }
    }
    smartlook?: any
  }
}

export {}
