import React from 'react'

import { Box, Flex, useDisclosure, useColorMode, Image } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import NavbarHelp from './help'
import NavbarInfo from './info'
/* import NavbarLanguages from './language' */
import NavbarSettings from './settings'
import NavbarTheme from './theme'
import NavbarUser from './user'
import NavbarWallet from './wallet'
import LogoDark from '../../assets/img/logo/dailyBid_black.svg'
import LogoLight from '../../assets/img/logo/dailyBid_white.svg'
import { RootState } from '../../store'
import AccountComponent from '../account'

const NavbarComponent: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode } = useColorMode()
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  return (
    <Flex
      w="100%"
      px={4}
      mt={2}
      justifyContent="space-between"
      borderBottom="1px solid"
      borderColor="grey.800"
      flexDirection={{ base: 'column', md: 'row' }}
    >
      <Box>
        <Image
          src={colorMode === 'dark' ? LogoLight : LogoDark}
          height="37px"
          mb="3px"
          alt="Logo"
        />
      </Box>
      <Flex flexDirection="row" alignItems="center" ml="auto">
        {isAuthenticated && <NavbarUser />}
        {/* <NavbarLanguages /> */}
        <NavbarTheme />
        <NavbarInfo />
        <NavbarHelp />
        <NavbarSettings />
        <NavbarWallet onOpen={onOpen} />
        <AccountComponent isOpen={isOpen} onClose={onClose} />
      </Flex>
    </Flex>
  )
}

export default NavbarComponent
