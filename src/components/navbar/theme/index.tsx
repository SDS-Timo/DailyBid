import React from 'react'

import { SunIcon, MoonIcon } from '@chakra-ui/icons'
import { useColorMode, IconButton, Flex } from '@chakra-ui/react'

const NavbarTheme: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex alignItems="center">
      <IconButton
        aria-label="Toggle theme"
        icon={colorMode === 'light' ? <SunIcon /> : <MoonIcon />}
        onClick={toggleColorMode}
        variant="unstyled"
        _hover={{ bg: 'transparent' }}
        _focus={{ outline: 'none' }}
      />
    </Flex>
  )
}

export default NavbarTheme
