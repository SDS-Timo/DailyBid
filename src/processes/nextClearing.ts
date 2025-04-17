import { useEffect, useState, useCallback } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import useAuctionQuery from '../hooks/useAuctionQuery'
import usePriceHistory from '../hooks/usePriceHistory'
import { RootState, AppDispatch } from '../store'
import { logout } from '../store/auth'
import { setUserPoints } from '../store/auth'
import { setBalances } from '../store/balances'
import { setOpenOrders } from '../store/orders'
import { setHeaderInformation, setPricesHistory } from '../store/prices'
import { setTrades } from '../store/trades'
import { checkUserAgentDelegation } from '../utils/authUtils'
import { calculateHeaderInformation } from '../utils/headerInformationUtils'
import { analytics } from '../utils/mixpanelUtils'

const NextClearingComponent: React.FC = () => {
  const [nextSession, setNextSession] = useState<string | undefined | null>(
    null,
  )
  const [nextSessionTime, setNextSessionTime] = useState<Date | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const orderSettings = useSelector(
    (state: RootState) => state.orders.orderSettings,
  )
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const fetchNextSession = useCallback(async () => {
    const { getNextSession } = usePriceHistory()
    const info = await getNextSession(userAgent)

    if (info?.datetime) {
      const auctionDate = new Date(info.datetime)
      setNextSessionTime(auctionDate)
    }
    setNextSession(info?.nextSession)
  }, [])

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    let timeoutId: ReturnType<typeof setInterval> | null = null

    const startPolling = () => {
      intervalId = setInterval(() => {
        fetchNextSession()
      }, 1000)
    }

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const handleSessionTime = async () => {
      if (!nextSessionTime) return

      const now = new Date()
      const timeDifference = nextSessionTime.getTime() - now.getTime()

      if (timeDifference > 1000) {
        const timeToWait = timeDifference - 1000

        if (!checkUserAgentDelegation(userAgent)) {
          dispatch(logout())
          // Mixpanel event tracking [User Logged Out]
          analytics.userLoggedOut(userPrincipal)
          localStorage.removeItem('identity')
          localStorage.removeItem('delegationIdentity')
          localStorage.removeItem('mnemonicPhrase')
        }

        const { getQuerys } = useAuctionQuery()
        const [priceHistoryResult, userDataResult] = await Promise.all([
          getQuerys(userAgent, {
            selectedSymbol: symbol ?? undefined,
            selectedQuote: selectedQuote,
            priceDigitsLimit: orderSettings.orderPriceDigitsLimit,
            queryTypes: ['price_history'],
          }),
          getQuerys(userAgent, {
            tokens: tokens,
            selectedQuote: selectedQuote,
            priceDigitsLimit: orderSettings.orderPriceDigitsLimit,
            queryTypes: ['open_orders', 'transaction_history', 'credits'],
          }),
        ])

        const { pricesHistory: prices = [] } = priceHistoryResult

        const {
          orders: openOrdersRaw = [],
          trades: tradesRaw = [],
          credits: balancesCredits = [],
          points,
        } = userDataResult

        const headerInformation = calculateHeaderInformation(
          prices,
          nextSession || '--',
        )
        dispatch(setHeaderInformation(headerInformation))
        dispatch(setPricesHistory(prices))
        dispatch(setBalances(balancesCredits))
        dispatch(setUserPoints(Number(points)))
        dispatch(setOpenOrders(openOrdersRaw))
        dispatch(setTrades(tradesRaw))

        timeoutId = setTimeout(() => {
          startPolling()
        }, timeToWait)
      } else {
        startPolling()
      }
    }

    if (nextSessionTime) {
      handleSessionTime()
    } else {
      fetchNextSession()
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      stopPolling()
    }
  }, [nextSessionTime, fetchNextSession, dispatch])

  return null
}
export default NextClearingComponent
