import React from 'react'

import { VStack } from '@chakra-ui/react'

import Withdrawals from './withdrawals'

const DoubleConfirmationSettings: React.FC = () => {
  return (
    <VStack align="stretch">
      <Withdrawals />
    </VStack>
  )
}

export default DoubleConfirmationSettings
