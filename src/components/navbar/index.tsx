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
import useDPasteApi from '../../hooks/useDpasteApi'
import useWindow from '../../hooks/useWindow'
import { RootState } from '../../store'
import { AppDispatch } from '../../store'
import { getAgent, doLogin } from '../../utils/authUtils'
import {
  mnemonicAuthenticate,
  retrieveStoredDelegationII,
} from '../../utils/authUtils'
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

  const { readPrivateSnippetFromDpaste } = useDPasteApi()

  // Telegram mini app - Automatic login mnemonic
  const processMnemonic = async (mnemonicPhrase: string) => {
    try {
      const sanitizePhrase = (phrase: string): string[] =>
        phrase.split(' ').filter((chunk) => chunk.trim() !== '')

      const sanitizedPhrase = sanitizePhrase(mnemonicPhrase)
      await mnemonicAuthenticate(sanitizedPhrase, dispatch)
    } catch (error) {
      console.error('Automatic authentication failed.')
    }
  }

  // Telegram mini app - Internet Identity delegation login
  const processDelegation = async (delegationCode: string, aesKey: string) => {
    const delegationJSON = await readPrivateSnippetFromDpaste(delegationCode)

    const genAesKeyUint8Array = new Uint8Array(Buffer.from(aesKey, 'hex'))

    const delegationDecrypted = decrypt(delegationJSON, genAesKeyUint8Array)

    if (delegationDecrypted) {
      try {
        const delegationChain = DelegationChain.fromJSON(
          JSON.parse(delegationDecrypted),
        )

        const identityJSON = localStorage.getItem('identity')
        const identity = identityJSON
          ? Ed25519KeyIdentity.fromJSON(identityJSON)
          : null

        if (identity) {
          const publicKey = Buffer.from(
            identity.getPublicKey().toDer(),
          ).toString('hex')

          const delegationChainPublicKey = Buffer.from(
            delegationChain.delegations[1].delegation.pubkey,
          ).toString('hex')

          if (publicKey === delegationChainPublicKey) {
            const delegationIdentity = DelegationIdentity.fromDelegation(
              identity,
              delegationChain,
            )

            // Stores delegation and identity keys as hex-encoded strings for secure storage or transmission.
            const delegationData = {
              delegationChain: delegationChain.toJSON(),
              identity: {
                publicKey: Buffer.from(
                  identity.getPublicKey().toDer(),
                ).toString('hex'),
                secretKey: Buffer.from(
                  JSON.stringify(identity.toJSON()),
                ).toString('hex'),
              },
            }

            localStorage.setItem(
              'delegationIdentity',
              JSON.stringify(delegationData),
            )

            const agent = getAgent(delegationIdentity)

            doLogin(agent, dispatch)
          }
        }
      } catch (error) {
        console.error('Failed to process delegation:', error)
      }
    } else {
      console.warn('Delegation parameter not found in the URL.')
    }
  }

  useEffect(() => {
    const processLogin = async () => {
      const restoredDelegationII = retrieveStoredDelegationII()

      const urlParams = new URL(window.location.href)

      const queryString = urlParams.searchParams.get('tgWebAppStartParam') || ''

      const [delegationCode, keyValue] = queryString.split('_')

      const aesKey = keyValue?.startsWith('key-') ? keyValue.split('-')[1] : ''

      if (isTelegram) {
        if (delegationCode) {
          processDelegation(delegationCode, aesKey)
        } else if (restoredDelegationII) {
          const agent = getAgent(restoredDelegationII)
          doLogin(agent, dispatch)
        } else {
          const localStorageSaved = localStorage.getItem('mnemonicPhrase')
          if (localStorageSaved) {
            const seed = decrypt(localStorageSaved)
            processMnemonic(seed)
          }
        }
      }
    }

    processLogin()
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
