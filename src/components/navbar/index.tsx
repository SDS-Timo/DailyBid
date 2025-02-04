import React, { useEffect } from 'react'

import { Box, Flex, useDisclosure, useColorMode, Image } from '@chakra-ui/react'
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from '@dfinity/identity'
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
import { getAgent, doLogin } from '../../utils/authUtils'
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
  const { isTelegram } = getIsTelegramApp()

  // Automatic login mnemonic
  const validateAndLogin = async (mnemonicPhrase: string) => {
    try {
      const sanitizePhrase = (phrase: string): string[] =>
        phrase.split(' ').filter((chunk) => chunk.trim() !== '')

      const sanitizedPhrase = sanitizePhrase(mnemonicPhrase)
      await mnemonicAuthenticate(sanitizedPhrase, dispatch)
    } catch (error) {
      console.error('Automatic authentication failed.')
    }
  }

  async function readPrivateSnippetFromDpaste(snippetCode: string) {
    try {
      const snippetUrl = `https://dpaste.com/${snippetCode}.txt`

      const API_TOKEN = process.env.ENV_DPASTE_API_KEY

      const response = await fetch(snippetUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch snippet: ${response.statusText}`)
      }

      const snippetContent = await response.text()
      return snippetContent
    } catch (error: any) {
      console.error('Error reading snippet from dpaste:', error.message)
      throw error
    }
  }

  useEffect(() => {
    const urlParams = new URL(window.location.href)
    const delegationCode =
      urlParams.searchParams.get('tgWebAppStartParam') || ''

    const processDelegation = async (delegationCode: string) => {
      const delegationJSON = await readPrivateSnippetFromDpaste(delegationCode)

      if (delegationJSON) {
        try {
          const delegationChain = DelegationChain.fromJSON(
            JSON.parse(delegationJSON),
          )

          const identityJSON = localStorage.getItem('identity')
          const identity = identityJSON
            ? Ed25519KeyIdentity.fromJSON(identityJSON)
            : null

          if (identity) {
            const delegationIdentity = DelegationIdentity.fromDelegation(
              identity,
              delegationChain,
            )

            const agent = getAgent(delegationIdentity)

            doLogin(agent, dispatch)
          }
        } catch (error) {
          console.error('Failed to process delegation:', error)
        }
      } else {
        console.warn('Delegation parameter not found in the URL.')
      }
    }

    if (delegationCode) {
      processDelegation(delegationCode)
    } else if (isTelegram) {
      const localStorageSaved = localStorage.getItem('mnemonicPhrase')
      if (localStorageSaved) {
        const seed = decrypt(localStorageSaved)
        validateAndLogin(seed)
      }
    }
  }, [isTelegram])

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
