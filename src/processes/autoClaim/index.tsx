import { useEffect, useRef, useState } from 'react'

import { useSelector } from 'react-redux'

import { useHandleAllTrackedDeposits } from './autoClaim'
import { RootState } from '../../store'

const AutoClaimTimer = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { handleAllTrackedDeposits } = useHandleAllTrackedDeposits()
  const [autoClaimInterval, setAutoClaimInterval] = useState<string | null>(
    null,
  )
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )

  useEffect(() => {
    const startTimer = (interval: number) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setInterval(async () => {
        await handleAllTrackedDeposits(userPrincipal)
      }, interval)
    }

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    const updateTimer = () => {
      if (
        autoClaimInterval &&
        !isNaN(Number(autoClaimInterval)) &&
        autoClaimInterval !== 'disabled' &&
        isAuthenticated
      ) {
        const intervalInMs = Number(autoClaimInterval) * 60 * 1000
        startTimer(intervalInMs)
      } else {
        stopTimer()
      }
    }

    updateTimer()

    return () => {
      stopTimer()
    }
  }, [autoClaimInterval, isAuthenticated, userPrincipal])

  useEffect(() => {
    const handleStorageChange = () => {
      const storedValue = localStorage.getItem('selectedTimeAutoClaimInterval')
      setAutoClaimInterval(storedValue)
    }

    handleStorageChange()

    const interval = setInterval(handleStorageChange, 10000)

    return () => clearInterval(interval)
  }, [])

  return null
}

export default AutoClaimTimer
