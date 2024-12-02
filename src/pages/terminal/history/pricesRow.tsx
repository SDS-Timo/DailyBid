import React from 'react'

import { Tr, Td, Flex, Image, Text } from '@chakra-ui/react'

import { TokenMetadata } from '../../../types'

interface PricesRowProps {
  token: TokenMetadata
}

const PricesRow: React.FC<PricesRowProps> = ({ token }) => {
  return (
    <Tr>
      <Td textAlign="center">
        <Flex align="center">
          <Image src={token.logo} alt={token.symbol} boxSize="30px" />
          <Text ml={2} fontSize="15px" fontWeight={600}>
            {token.symbol}
          </Text>
        </Flex>
      </Td>

      <Td textAlign="center">
        <Text fontSize="15px" fontWeight={500}>
          {Number(token.value).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: token.decimals,
          })}
        </Text>
      </Td>
    </Tr>
  )
}

export default PricesRow
