import React, { useState } from 'react'

import { SearchIcon } from '@chakra-ui/icons'
import {
  Flex,
  InputGroup,
  Input,
  InputLeftElement,
  Progress,
} from '@chakra-ui/react'
import { HttpAgent } from '@dfinity/agent'

import TokenRow from './tokenRow'
import { TokenDataItem, TokenMetadata } from '../../../../types'

interface TokenTabProps {
  balances: TokenDataItem[]
  userAgent: HttpAgent
  userPrincipal: string
  handleNotify: (principal: string | undefined, base: string) => void
  handleWithdraw: (
    amount: number,
    account: string | undefined,
    token: TokenMetadata,
  ) => void
  handleDeposit: (
    amount: number,
    account: string | undefined,
    token: TokenMetadata,
  ) => void
  showSearch?: boolean
  loading: boolean
}

const TokenTab: React.FC<TokenTabProps> = ({
  balances,
  userAgent,
  userPrincipal,
  handleNotify,
  handleWithdraw,
  handleDeposit,
  showSearch = false,
  loading,
}) => {
  const [filter, setFilter] = useState('')
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  const filteredBalances = balances.filter((token) =>
    token.base.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAccordionChange = (index: number) => {
    setActiveIndex(index === activeIndex ? undefined : index)
  }

  return (
    <>
      {showSearch && (
        <Flex justifyContent="flex-end" alignItems="center">
          <InputGroup size="xs" width="50%">
            <Input
              placeholder="Search"
              value={filter || ''}
              onChange={(e) => setFilter(e.target.value)}
              pr="2.5rem"
            />
            <InputLeftElement>
              <SearchIcon />
            </InputLeftElement>
          </InputGroup>
        </Flex>
      )}

      {loading && filteredBalances?.length <= 0 ? (
        <Flex justify="center" align="center" h="100px">
          <Progress size="xs" isIndeterminate w="90%" />
        </Flex>
      ) : (
        filteredBalances.map((token, index) => (
          <TokenRow
            key={token.id}
            token={token}
            userAgent={userAgent}
            userPrincipal={userPrincipal}
            handleNotify={handleNotify}
            handleWithdraw={handleWithdraw}
            handleDeposit={handleDeposit}
            currentIndex={activeIndex === index ? 0 : undefined}
            onAccordionChange={() => handleAccordionChange(index)}
          />
        ))
      )}
    </>
  )
}

export default TokenTab
