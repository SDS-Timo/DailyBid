import React from 'react'

import { IconButton, Flex } from '@chakra-ui/react'
import { IoIosHelpCircle } from 'react-icons/io'

const NavbarHelp: React.FC = () => {
  return (
    <Flex alignItems="center">
      <IconButton
        aria-label="Wallet"
        variant="unstyled"
        _hover={{ bg: 'transparent' }}
        _focus={{ outline: 'none' }}
        onClick={() => window.open(process.env.ENV_HELP_DOC_URL, '_blank')}
      >
        <IoIosHelpCircle
          style={{ marginLeft: '10px', marginTop: '4px' }}
          size="21px"
        />
      </IconButton>
    </Flex>
  )
}

export default NavbarHelp
