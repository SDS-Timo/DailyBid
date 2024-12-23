import { useState, useEffect } from 'react'

/**
 * Custom hook to get the the browser window information.
 */
const useWindow = () => {
  /**
   * This hook listens for window resize events and updates the width and height values
   * whenever the window size changes. It is useful for implementing responsive designs
   * or adjusting components dynamically based on the window dimensions.
   *
   * @returns An object containing:
   *   - `width` (number): The current width of the browser window in pixels.
   *   - `height` (number): The current height of the browser window in pixels.
   */
  const getWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    useEffect(() => {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowSize
  }

  /**
   * Checks if the application is running inside the Telegram in-app browser.
   * This function inspects the `navigator.userAgent` string for the presence of "Telegram".
   *
   * @returns `true` if the app is running in Telegram, otherwise `false`.
   */
  const getIsTelegramApp = () => {
    const [isTelegram, setIsTelegram] = useState(false)

    useEffect(() => {
      const checkTelegramDomain = () => {
        const ancestorOrigin = window.location.href

        return !!ancestorOrigin && ancestorOrigin.includes('tgWebAppData')
      }

      setIsTelegram(checkTelegramDomain())
    }, [])

    return isTelegram
  }

  return {
    getWindowSize,
    getIsTelegramApp,
  }
}
export default useWindow
