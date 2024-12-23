import React from 'react'

import { Flex, Button, useColorModeValue } from '@chakra-ui/react'

import { Option } from '../../types'
import AccountComponent from '../account'

interface LoginButtonComponentProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  symbol: Option | null
  height: string
}

const LoginButtonComponent: React.FC<LoginButtonComponentProps> = ({
  isOpen,
  onOpen,
  onClose,
  symbol,
  height,
}) => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.900', 'grey.25')

  return (
    <Flex justifyContent="center" alignItems="center" h={height}>
      <Button
        onClick={onOpen}
        variant="unstyled"
        _hover={{
          bg: bgColor,
          color: fontColor,
        }}
        fontSize="sm"
        size="sm"
        px="15px"
        isDisabled={!symbol}
      >
        Login or Create Account
      </Button>
      <AccountComponent isOpen={isOpen} onClose={onClose} />
    </Flex>
  )
}

export default LoginButtonComponent
