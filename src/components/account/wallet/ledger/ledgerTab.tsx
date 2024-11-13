import React, { useState, useEffect, useMemo, useCallback } from 'react'

import {
  Box,
  Flex,
  SimpleGrid,
  Input,
  FormControl,
  FormLabel,
  Text,
} from '@chakra-ui/react'
import { Select } from 'bymax-react-select'
import { useSelector } from 'react-redux'

import LedgerRow from './ledgerRow'
import customStyles from '../../../../common/styles'
import { RootState } from '../../../../store'
import { TokenDataItem, TokenMetadata, Option } from '../../../../types'
import { getAllTimezones } from '../../../../utils/dateUtils'

interface LedgerTabProps {
  tokens: TokenMetadata[]
}

const LedgerTab: React.FC<LedgerTabProps> = ({ tokens }) => {
  const [timezoneOptions, setTimezoneOptions] = useState<Option[]>([])
  const [selectedTimezoneOption, setSelectedTimezoneOption] = useState<
    Option | Option[] | null
  >(null)
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  )
  const [filteredData, setFilteredData] = useState<TokenDataItem[]>([])
  const [symbol, setSymbol] = useState<Option | Option[] | null>(null)
  const [initialBalance, setInitialBalance] = useState(0)
  const [finalBalance, setFinalBalance] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const actions = useSelector((state: RootState) => state.actions.actions)
  const trades = useSelector((state: RootState) => state.trades.trades)

  const token =
    Array.isArray(symbol) && symbol.length > 0 ? symbol[0] : (symbol as Option)

  const selectedTimezone =
    Array.isArray(selectedTimezoneOption) && selectedTimezoneOption.length > 0
      ? selectedTimezoneOption[0]
      : (selectedTimezoneOption as Option)

  const handleChange = useCallback((option: Option | Option[] | null) => {
    setSymbol(option)
  }, [])

  const handleTimezoneChange = useCallback(
    (option: Option | Option[] | null) => {
      setSelectedTimezoneOption(option)
    },
    [],
  )

  const options: Option[] = useMemo(
    () =>
      tokens.map((token) => ({
        id: token.symbol,
        value: token.symbol,
        label: token.base,
        image: token.logo || '',
        base: token.base,
        quote: '',
        decimals: token.decimals,
        principal: token.principal,
      })),
    [tokens],
  )

  const convertToTimestamp = (dateString: string, offsetString: string) => {
    const date = new Date(dateString)
    const offset = parseInt(offsetString.replace('UTC', ''), 10) || 0
    return date.getTime() + offset * 60 * 60 * 1000
  }

  const isWithinDateRange = useCallback(
    (date: string, start?: string, end?: string) => {
      const timestamp = convertToTimestamp(date, timezone)
      const startTime = start
        ? new Date(start).getTime()
        : Number.NEGATIVE_INFINITY
      const endTime = end ? new Date(end).getTime() : Number.POSITIVE_INFINITY
      return timestamp >= startTime && timestamp <= endTime
    },
    [timezone],
  )

  useEffect(() => {
    if ((!token?.label && (!startDate || !endDate)) || !selectedTimezone) {
      setFilteredData([])
      setInitialBalance(0)
      setFinalBalance(0)
      return
    }

    const getModifier = (item: any, isUSD: boolean) => {
      if (
        item.action === 'deposit' ||
        item.action === 'withdrawalRollback' ||
        (item.type === 'buy' && !isUSD) ||
        (item.type === 'sell' && isUSD)
      ) {
        return 1
      }
      if (
        item.action === 'withdrawal' ||
        (item.type === 'sell' && !isUSD) ||
        (item.type === 'buy' && isUSD)
      ) {
        return -1
      }
      return 0
    }

    const filterData = (data: any[], quoteCheck: boolean) => {
      return data.filter((item) => {
        let matchSymbol

        if (quoteCheck && token?.label?.toLowerCase().includes('usd')) {
          matchSymbol = (token as Option).label
            .toLowerCase()
            .includes(item.quote.toLowerCase())
        } else {
          matchSymbol = !token?.label || (token as Option).label === item.symbol
        }

        return matchSymbol
      })
    }

    const allActions = filterData(actions, false)
    const allTrades = filterData(trades, true)

    const allData = [...allActions, ...allTrades].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )

    const calculatedInitialBalance = allData.reduce((acc, item) => {
      const eventTime = convertToTimestamp(item.datetime, timezone)
      const startTime = startDate ? new Date(startDate).getTime() : 0

      if (eventTime < startTime) {
        const isUSD = token?.label.includes('USD')
        const volume =
          item.type && isUSD ? item.volumeInQuote : item.volumeInBase
        const modifier = getModifier(item, isUSD)
        return acc + modifier * volume
      }
      return acc
    }, 0)

    const filteredData = allData.filter((item) => {
      if (!startDate && !endDate) return true

      return isWithinDateRange(item.datetime, startDate, endDate)
    })

    const calculatedFinalBalance = allData.reduce((acc, item) => {
      const isUSD = token?.label.includes('USD')
      const volume = item.type && isUSD ? item.volumeInQuote : item.volumeInBase
      const modifier = getModifier(item, isUSD)

      return acc + modifier * volume
    }, 0)

    setInitialBalance(calculatedInitialBalance)
    setFinalBalance(calculatedFinalBalance)
    setFilteredData(filteredData)
  }, [
    token?.label,
    startDate,
    endDate,
    actions,
    trades,
    selectedTimezone,
    timezone,
    isWithinDateRange,
  ])

  useEffect(() => {
    const newTimezone = selectedTimezone
      ? selectedTimezone.value
      : Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(newTimezone)
  }, [selectedTimezone])

  useEffect(() => {
    const timezones = getAllTimezones()
    setTimezoneOptions(timezones)

    const userTimezoneOffset = -new Date().getTimezoneOffset() / 60
    const sign = userTimezoneOffset >= 0 ? '+' : ''
    const userTimezoneLabel = `UTC${sign}${userTimezoneOffset}`

    const defaultOption =
      timezones.find((tz) => tz.value === userTimezoneLabel) || null
    setSelectedTimezoneOption(defaultOption)
  }, [])

  return (
    <>
      <Box w="100%" zIndex="9" mb={4}>
        <Select
          id="symbols"
          value={token?.label ? token : null}
          isMulti={false}
          isClearable={true}
          options={options}
          placeholder={tokens?.length <= 0 ? 'Loading...' : 'Select a token'}
          noOptionsMessage="No tokens found"
          isLoading={tokens?.length <= 0}
          loadingMessage="Loading..."
          onChange={handleChange}
          styles={customStyles as any}
        />
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            type="date"
            value={startDate.split('T')[0]}
            onChange={(e) => {
              const selectedDate = e.target.value
              if (!selectedDate) {
                setStartDate('')
              } else {
                setStartDate(`${selectedDate}T00:00`)
              }
            }}
          />
          <FormLabel color="grey.500" fontSize="15px">
            Start Date
          </FormLabel>
        </FormControl>

        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            type="date"
            value={endDate.split('T')[0]}
            onChange={(e) => {
              const selectedDate = e.target.value
              if (!selectedDate) {
                setEndDate('')
              } else {
                setEndDate(`${selectedDate}T23:59`)
              }
            }}
          />
          <FormLabel color="grey.500" fontSize="15px">
            End Date
          </FormLabel>
        </FormControl>
      </SimpleGrid>

      <Box w="100%" zIndex="9" mb={4}>
        <Select
          id="timezones"
          value={selectedTimezone?.label ? selectedTimezone : null}
          isMulti={false}
          isClearable={false}
          options={timezoneOptions}
          placeholder="Select a timezone"
          noOptionsMessage="No timezones found"
          isLoading={timezoneOptions.length === 0}
          loadingMessage="Loading timezones..."
          onChange={handleTimezoneChange}
          styles={customStyles as any}
        />
      </Box>

      {filteredData.length > 0 ? (
        <>
          <Text mb={2} fontWeight="bold" textAlign="right">
            Starting balance:{' '}
            {initialBalance.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: token?.decimals,
            })}
          </Text>

          {filteredData.map((data) => (
            <LedgerRow
              key={`${data.id}-${data.base}`}
              data={data}
              symbol={token?.label}
              timezone={timezone}
            />
          ))}

          <Text mt={2} fontWeight="bold" textAlign="right">
            Ending balance:{' '}
            {finalBalance.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: token?.decimals,
            })}
          </Text>
        </>
      ) : (
        <Flex justify="center" mt={8}>
          No data
        </Flex>
      )}
    </>
  )
}

export default LedgerTab
