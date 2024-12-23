import React from 'react'

import { IconButton, Flex } from '@chakra-ui/react'
import { FaWallet } from 'react-icons/fa'

interface NavbarWalletProps {
  onOpen: () => void
}

const NavbarWallet: React.FC<NavbarWalletProps> = ({ onOpen }) => {
  return (
    <Flex alignItems="center">
      <IconButton
        aria-label="Wallet"
        variant="unstyled"
        _hover={{ bg: 'transparent' }}
        _focus={{ outline: 'none' }}
        onClick={onOpen}
      >
        <FaWallet
          style={{ marginLeft: '10px', marginTop: '4px' }}
          size="17px"
        />
      </IconButton>
    </Flex>
  )
}

export default NavbarWallet
