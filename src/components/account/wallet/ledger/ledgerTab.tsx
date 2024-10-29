import React, { useState, useEffect, useMemo, useCallback } from 'react'

import {
  Box,
  Flex,
  SimpleGrid,
  Input,
  Progress,
  FormControl,
  FormLabel,
  Text,
} from '@chakra-ui/react'
import { Select } from 'bymax-react-select'
import { useSelector } from 'react-redux'

import LedgerRow from './ledgerRow'
import { RootState } from '../../../../store'
import { TokenDataItem, TokenMetadata, Option } from '../../../../types'
import customStyles from '../styles'

interface LedgerTabProps {
  tokens: TokenMetadata[]
}

const LedgerTab: React.FC<LedgerTabProps> = ({ tokens }) => {
  const [filteredData, setFilteredData] = useState<TokenDataItem[]>([])
  const [symbol, setSymbol] = useState<Option | Option[] | null>(null)
  const [balance, setBalance] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const actions = useSelector((state: RootState) => state.actions.actions)
  const trades = useSelector((state: RootState) => state.trades.trades)

  const token =
    Array.isArray(symbol) && symbol.length > 0 ? symbol[0] : (symbol as Option)

  const handleChange = useCallback((option: Option | Option[] | null) => {
    setSymbol(option)
  }, [])

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

  const isWithinDateRange = useCallback(
    (date: string, start: string, end: string) => {
      const timestamp = new Date(date).getTime()
      const startTime = start ? new Date(start).getTime() : 0
      const endTime = end ? new Date(end).getTime() : Infinity
      return timestamp >= startTime && timestamp <= endTime
    },
    [],
  )

  useEffect(() => {
    if (!token?.label && (!startDate || !endDate)) {
      setFilteredData([])
      setBalance(0)
      return
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

        const matchDate = isWithinDateRange(item.datetime, startDate, endDate)
        return matchSymbol && matchDate
      })
    }

    const filteredActions = filterData(actions, false)
    const filteredTrades = filterData(trades, true)

    const mergedData = [...filteredActions, ...filteredTrades].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )

    const totalBalance = mergedData.reduce((acc, item) => {
      const isUSD = token?.label.includes('USD')
      const volume = item.type && isUSD ? item.volumeInQuote : item.volumeInBase

      const modifier =
        item.action === 'deposit' ||
        item.action === 'withdrawalRollback' ||
        (item.type === 'buy' && !isUSD) ||
        (item.type === 'sell' && isUSD)
          ? 1
          : item.action === 'withdrawal' ||
              (item.type === 'sell' && !isUSD) ||
              (item.type === 'buy' && isUSD)
            ? -1
            : 0

      return acc + modifier * volume
    }, 0)

    setBalance(totalBalance)
    setFilteredData(mergedData)
  }, [token?.label, startDate, endDate, actions, trades])

  return (
    <>
      {actions?.length <= 0 && trades?.length <= 0 ? (
        <Flex justify="center" align="center" h="100px">
          <Progress size="xs" isIndeterminate w="90%" />
        </Flex>
      ) : (
        <>
          <Box w="100%" zIndex="9" mb={4}>
            <Select
              id="symbols"
              value={token?.label ? token : null}
              isMulti={false}
              isClearable={true}
              options={options}
              placeholder={
                tokens?.length <= 0 ? 'Loading...' : 'Select a token'
              }
              noOptionsMessage="No tokens found"
              isLoading={tokens?.length <= 0}
              loadingMessage="Loading..."
              onChange={handleChange}
              styles={customStyles as any}
            />
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl variant="floating" hidden>
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

            <FormControl variant="floating" hidden>
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
          {filteredData.length > 0 ? (
            <>
              <Text mb={2} fontWeight="bold" textAlign="right">
                Starting balance: 0
              </Text>

              {filteredData.map((data) => (
                <LedgerRow
                  key={`${data.id}-${data.base}`}
                  data={data}
                  symbol={token?.label}
                />
              ))}

              <Text mt={2} fontWeight="bold" textAlign="right">
                Ending balance:{' '}
                {balance.toLocaleString('en-US', {
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
      )}
    </>
  )
}

export default LedgerTab
