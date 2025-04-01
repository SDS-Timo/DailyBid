import { useEffect, useState, useCallback } from 'react'

import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'

import AutoClaimTimer from './autoClaim'
import usePriceHistory from '../../../hooks/usePriceHistory'
import { RootState, AppDispatch } from '../../../store'
import { logout } from '../../../store/auth'
import { setIsRefreshUserData } from '../../../store/orders'
import { setIsRefreshPrices } from '../../../store/prices'
import { NextSession } from '../../../types'
import { checkUserAgentDelegation } from '../../../utils/authUtils'

const HeaderInformation = () => {
  const bgColor = useColorModeValue('grey.100', 'grey.900')
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const headerInformation = useSelector(
    (state: RootState) => state.prices.headerInformation,
  )
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const tooltipTextStandard = (
    <>
      {t(`Checking statistics`)}
      <br />
      {t(`Please wait...`)}
    </>
  )

  const [nextSession, setNextSession] = useState<NextSession | null>(null)
  const [nextSessionTime, setNextSessionTime] = useState<Date | null>(null)
  const [tooltipText, setTooltipText] = useState(tooltipTextStandard)

  const isLoading = !headerInformation

  const fetchStatistics = useCallback(async () => {
    if (symbol && symbol.principal && selectedQuote) {
      setTooltipText(tooltipTextStandard)

      const { getStatistics } = usePriceHistory()
      const stats = await getStatistics(userAgent, symbol, selectedQuote)

      if (stats) {
        const clearingPrice =
          stats?.clearingPrice !== undefined && stats.clearingPrice !== null
            ? stats.clearingPrice.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: symbol.decimals,
              })
            : null

        const clearingVolume =
          stats?.clearingVolume !== undefined && stats.clearingVolume !== null
            ? stats.clearingVolume.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: symbol.decimals,
              })
            : null

        const totalAskVolume =
          stats.totalAskVolume !== null
            ? stats.totalAskVolume.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: symbol.decimals,
              })
            : '-'

        const totalBidVolume =
          stats.totalBidVolume !== null
            ? stats.totalBidVolume.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: symbol.decimals,
              })
            : '-'

        const minAskPrice =
          stats?.minAskPrice !== undefined && stats.minAskPrice !== null
            ? stats.minAskPrice.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: symbol.decimals,
              })
            : null

        const maxBidPrice =
          stats?.maxBidPrice !== undefined && stats.maxBidPrice !== null
            ? stats.maxBidPrice.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: symbol.decimals,
              })
            : null

        setTooltipText(
          <>
            {clearingPrice !== null || clearingVolume !== null ? (
              <>
                {`${t('Clearing Price')}: ${clearingPrice || '-'} ${symbol?.quote}`}
                <br />
                {`${t('Clearing Volume')}: ${clearingVolume || '-'} ${symbol?.base}`}
                <br />
              </>
            ) : (
              <>
                {`${t('Highest Bid')}: ${maxBidPrice || '-'} ${symbol?.quote}`}
                <br />
                {`${t('Lowest Ask')}: ${minAskPrice || '-'} ${symbol?.quote}`}
                <br />
              </>
            )}
            {`${t('Total Bid Volume')}: ${totalBidVolume} ${symbol?.base}`}
            <br />
            {`${t('Total Ask Volume')}: ${totalAskVolume} ${symbol?.base}`}
          </>,
        )
      }
    }
  }, [symbol, selectedQuote, usePriceHistory])

  const fetchNextSession = useCallback(async () => {
    const { getNextSession } = usePriceHistory()
    const info = await getNextSession(userAgent)

    if (info?.datetime) {
      const auctionDate = new Date(info.datetime)
      setNextSessionTime(auctionDate)
    }
    setNextSession(info)
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

    const handleSessionTime = () => {
      if (!nextSessionTime) return

      const now = new Date()
      const timeDifference = nextSessionTime.getTime() - now.getTime()

      if (timeDifference > 1000) {
        const timeToWait = timeDifference - 1000

        if (!checkUserAgentDelegation(userAgent)) {
          dispatch(logout())
          localStorage.removeItem('identity')
          localStorage.removeItem('delegationIdentity')
          localStorage.removeItem('mnemonicPhrase')
        }

        dispatch(setIsRefreshUserData())
        dispatch(setIsRefreshPrices())

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

  useEffect(() => {
    fetchStatistics()
  }, [selectedSymbol, selectedQuote, fetchStatistics])

  return (
    <Flex direction="row" wrap="wrap" gap={4}>
      <Box
        mt={3}
        ml={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Stat size="sm">
            <StatLabel>{t('Last Clearing')}</StatLabel>
            <StatNumber>
              {typeof headerInformation?.lastAuction === 'number'
                ? `$${headerInformation?.lastAuction.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: headerInformation.priceDigitsLimit,
                  })}`
                : '--'}
            </StatNumber>
          </Stat>
        </Flex>
      </Box>
      <Box
        borderRadius="md"
        flex="1"
        mt={1}
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Stat size="sm">
            <StatLabel>{t('Previous Change')}</StatLabel>
            {typeof headerInformation?.previousChange.amount === 'number' &&
            typeof headerInformation?.previousChange.percentage === 'number' ? (
              headerInformation.previousChange.amount >= 0 ? (
                <>
                  <StatNumber>
                    $
                    {headerInformation.previousChange.amount.toLocaleString(
                      'en-US',
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits:
                          headerInformation.priceDigitsLimit,
                      },
                    )}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {headerInformation.previousChange.percentage.toFixed(2)}%
                  </StatHelpText>
                </>
              ) : (
                <>
                  <StatNumber>
                    $
                    {headerInformation.previousChange.amount.toLocaleString(
                      'en-US',
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits:
                          headerInformation.priceDigitsLimit,
                      },
                    )}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    {headerInformation.previousChange.percentage.toFixed(2)}%
                  </StatHelpText>
                </>
              )
            ) : (
              <StatNumber>--</StatNumber>
            )}
          </Stat>
        </Flex>
      </Box>
      <Box
        mt={3}
        ml={4}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Stat size="sm">
            <StatLabel>7d Volume</StatLabel>
            <StatNumber>
              {headerInformation &&
              typeof headerInformation.periodVolume === 'number' &&
              headerInformation.periodVolume > 0
                ? `$${headerInformation.periodVolume.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}`
                : '--'}
            </StatNumber>
          </Stat>
        </Flex>
      </Box>

      <Box
        display={{ base: 'block', md: 'none' }}
        mt={3}
        ml={-2}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Menu>
          <MenuButton
            _hover={{ bg: 'transparent' }}
            _focus={{ outline: 'none' }}
            onClick={() => fetchStatistics()}
          >
            <Stat size="sm">
              <StatLabel>{t('Next Clearing')}</StatLabel>
              <StatNumber>
                {nextSession ? nextSession.nextSession : '--'}
              </StatNumber>
            </Stat>
          </MenuButton>
          <MenuList bg={bgColor} p={4}>
            <MenuItem bg={bgColor}>{tooltipText}</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <Box
        display={{ base: 'none', md: 'block' }}
        mt={3}
        ml={-2}
        borderRadius="md"
        flex="1"
        filter={isLoading ? 'blur(5px)' : 'none'}
      >
        <Flex direction="column">
          <Tooltip label={tooltipText} aria-label="Statistics">
            <Stat size="sm" onMouseEnter={() => fetchStatistics()}>
              <StatLabel>{t('Next Clearing')}</StatLabel>
              <StatNumber>
                {nextSession ? nextSession.nextSession : '--'}
              </StatNumber>
            </Stat>
          </Tooltip>
        </Flex>
      </Box>
      <AutoClaimTimer />
    </Flex>
  )
}

export default HeaderInformation
