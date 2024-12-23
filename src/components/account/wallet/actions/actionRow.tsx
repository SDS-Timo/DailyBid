import React from 'react'

import { Flex, Image, Text } from '@chakra-ui/react'

import { TokenDataItem } from '../../../../types'
import ActionIcon from '../../../actionIcon'

interface ActionRowProps {
  data: TokenDataItem
}

const ActionRow: React.FC<ActionRowProps> = ({ data }) => {
  return (
    <Flex key={data.id} justify="space-between" align="center" py={2}>
      <Flex align="center">
        <Image src={data.logo} alt={data.symbol} boxSize="30px" />
        <Text ml={2} fontSize="15px" fontWeight={600}>
          {data.symbol}
        </Text>
      </Flex>
      <Flex direction="column" align="flex-end" ml={2} overflowX="auto">
        <Flex align="center" overflowX="auto" whiteSpace="nowrap">
          <Text
            mr={2}
            color={
              data.action === 'withdrawal'
                ? 'red.500'
                : data.action === 'deposit'
                  ? 'green.500'
                  : 'inherit'
            }
          >
            {data.action === 'withdrawal' ? '-' : ''}
            {data.volumeInBase.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: data.decimals,
            })}
          </Text>
          <ActionIcon action={data.action} />
        </Flex>

        <Flex>
          <Text fontSize="12px">{data.datetime}</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ActionRow
