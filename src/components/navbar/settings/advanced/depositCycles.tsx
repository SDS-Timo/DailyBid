import React, { useState } from 'react'

import { Flex, Text, Switch } from '@chakra-ui/react'

const DepositCycles: React.FC = () => {
  const getInitialState = () => {
    const savedState = localStorage.getItem('depositCyclesConfirmation')
    return savedState === 'true'
  }

  const [isDepositCyclesConfirmation, setIsDepositCyclesConfirmation] =
    useState(getInitialState)

  const handleToggle = () => {
    const newState = !isDepositCyclesConfirmation
    setIsDepositCyclesConfirmation(newState)
    localStorage.setItem('depositCyclesConfirmation', String(newState))
  }

  return (
    <Flex align="center" justify="space-between" p={1}>
      <Text>Enable Deposit Cycles</Text>
      <Switch
        isChecked={isDepositCyclesConfirmation}
        onChange={handleToggle}
        sx={{
          '& .chakra-switch__track': {
            bg: 'grey.500',
          },
          '& .chakra-switch__track[data-checked]': {
            bg: 'blue.500',
          },
        }}
      />
    </Flex>
  )
}

export default DepositCycles
