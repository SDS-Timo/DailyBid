import React from 'react'

import { VStack } from '@chakra-ui/react'

import DepositCycles from './depositCycles'

const DoubleConfirmationSettings: React.FC = () => {
  return (
    <VStack align="stretch">
      <DepositCycles />
    </VStack>
  )
}

export default DoubleConfirmationSettings
