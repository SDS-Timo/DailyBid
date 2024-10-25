import React, { useState, useEffect, useMemo, useCallback } from 'react'

import {
  Box,
  Flex,
  SimpleGrid,
  Input,
  Progress,
  useColorModeValue,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { HttpAgent } from '@dfinity/agent'
import { Select } from 'bymax-react-select'
import { FiSearch } from 'react-icons/fi'
import { useSelector } from 'react-redux'

import ActionRow from './actionRow'
import useDepositHistory from '../../../../hooks/useDepositHistory'
import { RootState } from '../../../../store'
import { TokenDataItem, TokenMetadata, Option } from '../../../../types'
import customStyles from '../styles'

interface ActionTabProps {
  userAgent: HttpAgent
  tokens: TokenMetadata[]
}

const ActionTab: React.FC<ActionTabProps> = ({ userAgent, tokens }) => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')

  const [loading, setLoading] = useState(true)
  const [histories, setHistories] = useState<TokenDataItem[]>([])
  const [filteredHistories, setFilteredHistories] = useState<TokenDataItem[]>(
    [],
  )
  const [symbol, setSymbol] = useState<Option | Option[] | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const trades = useSelector((state: RootState) => state.trades.trades)

  const token =
    Array.isArray(symbol) && symbol.length > 0
      ? symbol[0]
      : (symbol as Option | null)

  const fetchDepositHistory = useCallback(async () => {
    setLoading(true)
    const { getDepositHistory } = useDepositHistory()
    const data = await getDepositHistory(userAgent, tokens)
    setHistories(data)
    setLoading(false)
  }, [userAgent, tokens])

  useEffect(() => {
    fetchDepositHistory()
  }, [fetchDepositHistory])

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
      setFilteredHistories(histories)
      return
    }

    const filteredHistories = histories.filter((history) => {
      const matchSymbol =
        !token?.label || (token as Option).label === history.symbol
      const matchDate = isWithinDateRange(history.datetime, startDate, endDate)
      return matchSymbol && matchDate
    })

    setFilteredHistories(filteredHistories)
  }, [token?.label, startDate, endDate, histories, trades])

  return (
    <>
      {loading && histories?.length <= 0 ? (
        <Flex justify="center" align="center" h="100px">
          <Progress size="xs" isIndeterminate w="90%" />
        </Flex>
      ) : (
        <>
          <Flex justify="flex-end" mb={2} w="100%">
            <Tooltip label="Filters" aria-label="Filters Tooltip">
              <IconButton
                aria-label="Show Filters"
                icon={<FiSearch />}
                variant="ghost"
                size="sm"
                _hover={{
                  bg: bgColorHover,
                }}
                onClick={() => setShowFilters(!showFilters)}
              />
            </Tooltip>
          </Flex>

          {showFilters && (
            <>
              <Box w="100%" zIndex="9" mb={4}>
                <Select
                  id="symbols"
                  value={token?.label ? token : null}
                  isMulti={false}
                  isClearable={true}
                  options={options}
                  placeholder={
                    loading && tokens?.length <= 0
                      ? 'Loading...'
                      : 'Select a token'
                  }
                  noOptionsMessage="No tokens found"
                  isLoading={loading}
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
            </>
          )}

          {filteredHistories.length > 0 ? (
            filteredHistories.map((data) => (
              <ActionRow key={data.id} data={data} />
            ))
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

export default ActionTab
