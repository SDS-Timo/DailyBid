import React, { useEffect } from 'react'

import { Box, Flex, useDisclosure, useColorMode, Image } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'

import NavbarHelp from './help'
import NavbarInfo from './info'
/* import NavbarLanguages from './language' */
import NavbarSettings from './settings'
import NavbarTheme from './theme'
import NavbarUser from './user'
import NavbarWallet from './wallet'
import LogoDark from '../../assets/img/logo/dailyBid_black.svg'
import LogoLight from '../../assets/img/logo/dailyBid_white.svg'
import useWindow from '../../hooks/useWindow'
import { RootState } from '../../store'
import { AppDispatch } from '../../store'
import { mnemonicAuthenticate } from '../../utils/authUtils'
import { decrypt } from '../../utils/cryptoUtils'
import AccountComponent from '../account'

const NavbarComponent: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode } = useColorMode()
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const dispatch = useDispatch<AppDispatch>()

  const { getIsTelegramApp } = useWindow()
  const isTelegramApp = getIsTelegramApp()

  const sanitizePhrase = (phrase: string): string[] =>
    phrase.split(' ').filter((chunk) => chunk.trim() !== '')

  const validateAndLogin = async (mnemonicPhrase: string) => {
    try {
      const sanitizedPhrase = sanitizePhrase(mnemonicPhrase)
      await mnemonicAuthenticate(sanitizedPhrase, dispatch)
    } catch (error) {
      console.error('Automatic authentication failed.')
    }
  }

  useEffect(() => {
    if (isTelegramApp) {
      const localStorageSaved = localStorage.getItem('mnemonicPhrase')
      if (localStorageSaved) {
        const seed = decrypt(localStorageSaved)
        validateAndLogin(seed)
      }
    }
  }, [isTelegramApp])

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
