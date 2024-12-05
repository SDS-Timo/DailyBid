import React, { useState, useEffect, useMemo } from 'react'

import { Box, Table, Thead, Tbody, Tr, Th, Text } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import HistoryRow from './historyRow'
import { RootState } from '../../../store'
import { DataItem } from '../../../types'

const PriceHistory: React.FC = () => {
  const [prices, setPrices] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toggleVolume, setToggleVolume] = useState('base')

  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const pricesHistory = useSelector(
    (state: RootState) => state.prices.pricesHistory,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  const handleToggleVolume = () => {
    setToggleVolume((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }

  const pricesFiltered = useMemo(() => {
    if (pricesHistory.length > 0) {
      return [...pricesHistory].reverse().slice(0, 17)
    }
    return []
  }, [pricesHistory])

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => {
      setPrices(pricesFiltered)
      if (symbol) setLoading(false)
    }, 500)

    return () => clearTimeout(timeout)
  }, [pricesFiltered, symbol])

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      <Box overflowX="auto">
        <Table variant="unstyled" size="sm">
          <Thead>
            <Tr>
              <Th textAlign="center">Price</Th>
              <Th
                textAlign="center"
                whiteSpace="nowrap"
                cursor="pointer"
                onClick={handleToggleVolume}
                _hover={{ textDecoration: 'underline' }}
              >
                Volume
                <Text as="span" fontSize="10px">
                  {' '}
                  (
                  {symbol && toggleVolume === 'quote'
                    ? symbol.quote
                    : symbol && symbol.base}
                  )
                </Text>
              </Th>
              <Th textAlign="center" whiteSpace="nowrap">
                Date
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {prices.map((data) => (
              <HistoryRow
                key={data.id}
                data={data}
                symbol={symbol}
                toggleVolume={toggleVolume}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}

export default PriceHistory
