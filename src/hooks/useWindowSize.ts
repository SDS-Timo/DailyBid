import { useState, useEffect } from 'react'

/**
 * Custom hook to get the current size of the browser window.
 *
 * This hook listens for window resize events and updates the width and height values
 * whenever the window size changes. It is useful for implementing responsive designs
 * or adjusting components dynamically based on the window dimensions.
 *
 * @returns An object containing:
 *   - `width` (number): The current width of the browser window in pixels.
 *   - `height` (number): The current height of the browser window in pixels.
 */
const useWindowSize = () => {
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

export default useWindowSize
