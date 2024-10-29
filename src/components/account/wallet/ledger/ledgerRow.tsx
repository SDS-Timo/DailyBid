import React from 'react'

import { Flex, Text } from '@chakra-ui/react'

import { TokenDataItem } from '../../../../types'
import { getMinimumFractionDigits } from '../../../../utils/calculationsUtils'
import { capitalizeFirstLetter } from '../../../../utils/stringsUtils'

interface LedgerRowProps {
  data: TokenDataItem
  symbol: string
}

const formatDateTime = (datetime: string) => {
  const date = new Date(datetime)
  return {
    date: date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  }
}

const determineColor = (data: TokenDataItem, symbol: string) => {
  if (data.action === 'deposit' || data.action === 'withdrawalRollback') {
    return 'green.500'
  }
  if (
    (data.type === 'buy' && symbol && !symbol.includes('USD')) ||
    (data.type === 'sell' && symbol && symbol.includes('USD'))
  ) {
    return 'green.500'
  }
  if (
    data.action === 'withdrawal' ||
    (data.type === 'sell' && symbol && !symbol.includes('USD')) ||
    (data.type === 'buy' && symbol && symbol.includes('USD'))
  ) {
    return 'red.500'
  }
  return 'inherit'
}

const determineVolume = (data: TokenDataItem, symbol: string) => {
  const volume =
    data.type && symbol && symbol.includes('USD')
      ? data.volumeInQuote.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: data.quoteDecimals,
        })
      : data.volumeInBase.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: data.decimals,
        })

  const prefix =
    data.action === 'deposit' ||
    data.action === 'withdrawalRollback' ||
    (data.type === 'buy' && symbol && !symbol.includes('USD'))
      ? '+'
      : '-'

  return `${prefix}${volume}`
}

const LedgerRow: React.FC<LedgerRowProps> = ({ data, symbol }) => {
  const { date, time } =
    data.date && data.time
      ? { date: data.date, time: data.time }
      : formatDateTime(data.datetime)
  const color = determineColor(data, symbol)
  const volumeText = determineVolume(data, symbol)
  const priceText = data.price.toLocaleString('en-US', {
    minimumFractionDigits: getMinimumFractionDigits(
      String(data.price),
      Number(data.priceDigitsLimit),
    ),
    maximumFractionDigits: data.priceDigitsLimit,
  })

  return (
    <Flex key={data.id} justify="space-between" align="center" py={1}>
      <Flex direction="column" align="center" width="90px" whiteSpace="nowrap">
        <Text>{date}</Text>
        <Text fontSize="12px" color="grey.400">
          {time}
        </Text>
      </Flex>

      <Flex
        direction="row"
        align="center"
        justify="space-between"
        width="100%"
        alignSelf="flex-start"
      >
        <Flex direction="row" align="flex-start">
          <Text ml={3}>{capitalizeFirstLetter(data.action || data.type)}</Text>
          {data.type && (
            <Text ml={1}>
              {symbol && symbol.includes('USD') ? `${data.base} ` : null}@
              {priceText}
            </Text>
          )}
        </Flex>

        <Flex direction="row" align="flex-end" whiteSpace="nowrap">
          <Text color={color}>{volumeText}</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default LedgerRow
