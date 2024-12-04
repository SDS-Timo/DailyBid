import React from 'react'

import { Tr, Td, Text } from '@chakra-ui/react'

import { TokenApi } from '../../../types'

interface PricesRowProps {
  token: TokenApi
}

const PricesRow: React.FC<PricesRowProps> = ({ token }) => {
  return (
    <Tr>
      <Td textAlign="center">
        <Text fontSize="15px" fontWeight={600}>
          {token.symbol}
        </Text>
      </Td>
      <Td textAlign="center">
        <Text fontSize="15px" fontWeight={400}>
          {token.name}
        </Text>
      </Td>

      <Td textAlign="center">
        <Text fontSize="15px" fontWeight={500}>
          {Number(token.value).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
          })}
        </Text>
      </Td>
    </Tr>
  )
}

export default PricesRow
