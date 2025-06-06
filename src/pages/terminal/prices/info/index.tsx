import React, { useState, useEffect, useCallback } from 'react'

import { Box, Table, Thead, Tbody, Tr, Th } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'

import InfoRow from './infoRow'
import BinanceTokens from '../../../../common/binanceTokens.json'
import useBinancePricesApi from '../../../../hooks/useBinancePricesApi'
import useDexscreenerPricesApi from '../../../../hooks/useDexscreenerPricesApi'
import useMetalPriceApi from '../../../../hooks/useMetalPricesApi'
import { RootState, AppDispatch } from '../../../../store'
import { setPricesInfo } from '../../../../store/prices'
import { TokenApi } from '../../../../types'

const Info: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [metalPrices, setMetalPrices] = useState<TokenApi[]>([])
  const [cryptoPrices, setCryptoPrices] = useState<TokenApi[]>([])
  const { t } = useTranslation()

  const { userAgent } = useSelector((state: RootState) => state.auth)

  const dispatch = useDispatch<AppDispatch>()

  const ICP_TOKENS = process.env.ENV_CRYPTO_DEXSCREENER_API_ICP_TOKENS || ''

  const fetchPrices = useCallback(async () => {
    setLoading(true)
    const { getMetalPriceApi } = useMetalPriceApi()
    const { getDexscreenerPricesData } = useDexscreenerPricesApi()
    const { getBinancePricesData } = useBinancePricesApi()

    try {
      const [
        fetchedMetalPrices,
        fetchedBinancePrices,
        fetchedDexscreenerPricesIcp,
      ] = await Promise.all([
        getMetalPriceApi(userAgent),
        getBinancePricesData(BinanceTokens),
        getDexscreenerPricesData(ICP_TOKENS),
      ])

      const filteredBinancePrices = Object.values(
        fetchedBinancePrices as Record<string, any>,
      ).map(
        ({ name, value, timestamp, baseToken }): TokenApi => ({
          symbol: baseToken,
          name,
          value: parseFloat(value),
          timestamp: BigInt(timestamp),
        }),
      )

      const filteredDexscreenerPricesIcp = Object.values(
        fetchedDexscreenerPricesIcp as Record<string, any>,
      ).map(
        ({ name, value, timestamp, baseToken }): TokenApi => ({
          symbol: baseToken.symbol,
          name,
          value: parseFloat(value),
          timestamp: BigInt(timestamp),
        }),
      )

      const mergedData = [
        ...filteredBinancePrices,
        ...filteredDexscreenerPricesIcp,
        ...fetchedMetalPrices,
      ]

      dispatch(setPricesInfo(mergedData))
      setCryptoPrices(mergedData)
      setMetalPrices(fetchedMetalPrices)
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
      if (metalPrices.length > 0 && metalPrices[0].timestamp) {
        const now = Date.now()

        const syncTimestamp = Number(metalPrices[0].timestamp) * 1000
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
  }, [metalPrices, fetchPrices])

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      <Box overflowX="auto">
        <Table variant="unstyled" size="sm">
          <Thead>
            <Tr>
              <Th textAlign="center">{t('Symbol')}</Th>
              <Th textAlign="center">{t('Name')}</Th>
              <Th textAlign="center">{t('Price')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {cryptoPrices.map((token) => (
              <InfoRow key={token.symbol} token={token} />
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default Info
