import React, { useState } from 'react'

import { Flex, Text, Switch } from '@chakra-ui/react'

const Withdrawals: React.FC = () => {
  const getInitialState = () => {
    const savedState = localStorage.getItem('withdrawalsDoubleConfirmation')
    return savedState === 'true'
  }

  const [isDoubleConfirmation, setIsDoubleConfirmation] =
    useState(getInitialState)

  const handleToggle = () => {
    const newState = !isDoubleConfirmation
    setIsDoubleConfirmation(newState)
    localStorage.setItem('withdrawalsDoubleConfirmation', String(newState))
  }

  return (
    <Flex align="center" justify="space-between" p={1}>
      <Text>Withdrawals</Text>
      <Switch
        isChecked={isDoubleConfirmation}
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

export default Withdrawals
