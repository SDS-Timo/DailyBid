import React, { useState, useEffect, useCallback } from 'react'

import { Box, Table, Thead, Tbody, Tr, Th } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import InfoRow from './infoRow'
import useMetalPriceApi from '../../../../hooks/useMetalPricesApi'
import { RootState } from '../../../../store'
import { TokenApi } from '../../../../types'

const Info: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState<TokenApi[]>([])

  const { userAgent } = useSelector((state: RootState) => state.auth)

  const fetchPrices = useCallback(async () => {
    setLoading(true)
    const { getMetalPriceApi } = useMetalPriceApi()
    try {
      const fetchedPrices = await getMetalPriceApi(userAgent)
      setPrices(fetchedPrices)
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setLoading(false)
    }
  }, [userAgent])

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const startPolling = () => {
      intervalId = setInterval(() => {
        fetchPrices()
      }, 10000)
    }

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const handleSessionTime = () => {
      if (prices.length > 0 && prices[0].timestamp) {
        const now = Date.now()

        const syncTimestamp = Number(
          BigInt(prices[0].timestamp) / BigInt(1_000_000),
        )

        const remainingTime = Math.max(2 * 60 * 1000 - (now - syncTimestamp), 0)
        if (remainingTime > 0) {
          timeoutId = setTimeout(() => {
            startPolling()
          }, remainingTime)
        } else {
          startPolling()
        }
      } else {
        fetchPrices()
      }
    }

    handleSessionTime()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      stopPolling()
    }
  }, [prices, fetchPrices])

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      <Box overflowX="auto">
        <Table variant="unstyled" size="sm">
          <Thead>
            <Tr>
              <Th textAlign="center">Symbol</Th>
              <Th textAlign="center">Name</Th>
              <Th textAlign="center">Price</Th>
            </Tr>
          </Thead>
          <Tbody>
            {prices.map((token) => (
              <InfoRow key={token.symbol} token={token} />
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default Info
