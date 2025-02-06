import React, { useState } from 'react'

import { CopyIcon } from '@chakra-ui/icons'
import {
  Button,
  Heading,
  Text,
  Box,
  Image,
  Link,
  IconButton,
  useClipboard,
  useColorMode,
  useToast,
} from '@chakra-ui/react'
import { DerEncodedPublicKey } from '@dfinity/agent'
import { AuthClient } from '@dfinity/auth-client'
import {
  DelegationIdentity,
  Ed25519PublicKey,
  ECDSAKeyIdentity,
  DelegationChain,
} from '@dfinity/identity'
import { Select } from 'bymax-react-select'
import { Helmet } from 'react-helmet-async'

import LogoDark from '../../assets/img/logo/dailyBid_black.svg'
import LogoLight from '../../assets/img/logo/dailyBid_white.svg'
import IILogo from '../../assets/img/logo/ii-logo.png'
import TelegramLogo from '../../assets/img/logo/telegram-logo.png'
import customStyles from '../../common/styles'
import useDPasteApi from '../../hooks/useDpasteApi'
import { Option } from '../../types'
import { getInternetIdentityDerivationOrigin } from '../../utils/canisterUtils'
import { hexToByteArray } from '../../utils/convertionsUtils'
import { generateAESKey, encrypt } from '../../utils/cryptoUtils'

let appPublicKey: Ed25519PublicKey | null = null

function getSessionKeyFromQuery(): string {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('sessionKey') || ''
}

const LoginII: React.FC = () => {
  const [userPrincipal, setUserPrincipal] = useState('')
  const [delegationCode, setDelegationCode] = useState('')
  const [aesKey, setAesKey] = useState('')
  const [selectedTime, setSelectedTime] = useState<Option | null>({
    id: '720',
    value: '720',
    label: '30d',
  })

  const { saveToDpasteWithAuth } = useDPasteApi()

  const deepLink = `${process.env.ENV_TELEGRAM_DEEP_LINK}&startapp=${delegationCode}`
  const alternativeLink = `${process.env.ENV_TELEGRAM_ALTERNATIVE_LINK}?startapp=${delegationCode}`

  const { onCopy: onCopyDeepLink } = useClipboard(`${deepLink}_key-${aesKey}`)
  const { onCopy: onCopyAltLink } = useClipboard(
    `${alternativeLink}_key-${aesKey}`,
  )

  const { colorMode } = useColorMode()

  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })

  const handleCopy = (link: string) => {
    if (link === 'deepLink') onCopyDeepLink()
    else if (link === 'alternativeLink') onCopyAltLink()

    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const selectOptions = [
    { id: '1', value: '0.0833', label: '5m' },
    { id: '2', value: '0.25', label: '15m' },
    { id: '3', value: '1', label: '1h' },
    { id: '4', value: '3', label: '3h' },
    { id: '5', value: '12', label: '12h' },
    { id: '6', value: '24', label: '1d' },
    { id: '7', value: '168', label: '7d' },
    { id: '8', value: '720', label: '30d' },
  ]

  const handleLoginDurationOptionChange = (
    option: Option | Option[] | null,
  ) => {
    const optionValue =
      Array.isArray(option) && option.length > 0
        ? option[0]
        : (option as Option | null)

    if (optionValue && optionValue !== undefined && optionValue.value) {
      setSelectedTime(optionValue)
    }
  }

  const handleClick = async () => {
    let delegationChain

    const newTab = window.open('about:blank', '_blank')

    if (!newTab) {
      alert('Popup blocked! Please allow pop-ups and try again.')
      return
    }

    const originalWindowOpen = window.open
    window.open = function (url, target) {
      if (newTab && !newTab.closed) {
        if (url) {
          newTab.location.href = url.toString()
        }
        return newTab
      }
      return originalWindowOpen(url, target)
    }

    try {
      const appPublicKeyDer = hexToByteArray(getSessionKeyFromQuery())
      appPublicKey = Ed25519PublicKey.fromDer(
        appPublicKeyDer as unknown as DerEncodedPublicKey,
      )

      const middleKeyIdentity = await ECDSAKeyIdentity.generate()
      const authClient = await AuthClient.create({
        identity: middleKeyIdentity,
      })

      const AUTH_EXPIRATION_INTERNET_IDENTITY = BigInt(
        Number(selectedTime?.value) * 60 * 60 * 1000 * 1000 * 1000,
      )

      await new Promise((resolve) => {
        authClient.login({
          maxTimeToLive: AUTH_EXPIRATION_INTERNET_IDENTITY,
          identityProvider: `${process.env.HTTP_AGENT_HOST}/#authorize`,
          derivationOrigin: process.env.ENV_AUTH_DERIVATION_ORIGIN,
          onSuccess: resolve,
        })
      })

      const middleIdentity = authClient.getIdentity()
      setUserPrincipal(middleIdentity.getPrincipal().toText())

      if (
        appPublicKey != null &&
        middleIdentity instanceof DelegationIdentity
      ) {
        try {
          const middleToApp = await DelegationChain.create(
            middleKeyIdentity,
            appPublicKey,
            new Date(Date.now() + Number(selectedTime?.value) * 60 * 60 * 1000),
            { previous: middleIdentity.getDelegation() },
          )

          delegationChain = middleToApp
        } catch (error: any) {
          console.error('Failed to create delegation chain:', error.message)
        }
      }

      if (delegationChain) {
        const returnTo = process.env.ENV_TELEGRAM_DEEP_LINK

        const genAesKey = await generateAESKey()
        const genAesKeyUint8Array = new Uint8Array(
          Buffer.from(genAesKey, 'hex'),
        )
        setAesKey(genAesKey)

        const delegationEncrypted = encrypt(
          JSON.stringify(delegationChain),
          genAesKeyUint8Array,
        )

        const delegationCodeDPaste =
          await saveToDpasteWithAuth(delegationEncrypted)

        setDelegationCode(delegationCodeDPaste)

        const miniAppUrl = `${returnTo}&startapp=${delegationCodeDPaste}_key-${genAesKey}`

        window.location.href = miniAppUrl

        window.onblur = () => {
          window.onfocus = () => {
            //setTimeout(() => window.close(), 1000)
          }
        }
      } else {
        console.error('Delegation chain is undefined.')
      }
    } catch (error) {
      console.error('Error during login:', error)
      newTab.close()
    }

    setTimeout(() => {
      window.open = originalWindowOpen
    }, 5000)
  }

  return (
    <Box
      textAlign="center"
      width="100%"
      height={{ base: '80vh', md: 'auto' }}
      paddingTop={{ base: '16px', md: '0' }}
      paddingBottom={{ base: '16px', md: '0' }}
    >
      <Helmet title="DailyBid login for Telegram mini app" />
      <Heading as="h1" size="2xl" fontWeight="bold" mb={8}>
        Internet Identity
      </Heading>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        mb={8}
        maxWidth="900px"
        height="400px"
        width="100%"
        margin="auto"
        top="0"
        left="0"
        right="0"
        padding="16px"
        overflowX="auto"
        whiteSpace="nowrap"
      >
        <Box
          textAlign="right"
          pr={4}
          minWidth="150px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="right"
            minH="58px"
          >
            <Text fontSize="lg" fontWeight="normal">
              Duration (TTL):
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="right"
            mt={2}
          >
            <Text fontSize="lg" fontWeight="normal">
              Derivation Origin:
            </Text>
          </Box>
          {userPrincipal && (
            <>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="right"
                mt={2}
              >
                <Text fontSize="lg" fontWeight="normal">
                  User Principal:
                </Text>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="right"
                mt={2}
              >
                <Text fontSize="lg" fontWeight="normal">
                  Deep Link:
                </Text>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="right"
                mt={3}
              >
                <Text fontSize="lg" fontWeight="normal">
                  Alternative Link:
                </Text>
              </Box>
            </>
          )}
        </Box>

        <Box
          textAlign="left"
          pl={4}
          minWidth="250px"
          display="flex"
          flexDirection="column"
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="left"
            maxW={300}
          >
            <Select
              id="loginDuration"
              value={selectedTime}
              isMulti={false}
              isClearable={false}
              isLocked={!!userPrincipal}
              options={selectOptions}
              placeholder="Select the login duration"
              noOptionsMessage="No data"
              onChange={handleLoginDurationOptionChange}
              styles={customStyles as any}
            />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="left"
            mt={2}
          >
            <Text fontSize="lg" fontWeight="normal">
              {getInternetIdentityDerivationOrigin()}
            </Text>
          </Box>

          {userPrincipal && (
            <>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="left"
                mt={2}
              >
                <Text fontSize="lg" fontWeight="normal">
                  {userPrincipal}
                </Text>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="left"
                mt={2}
              >
                <Text fontSize="lg" fontWeight="normal">
                  <Link href={`${deepLink}_key-${aesKey}`} isExternal>
                    {deepLink}
                  </Link>
                  <IconButton
                    aria-label="Copy link"
                    icon={<CopyIcon />}
                    size="sm"
                    onClick={() => handleCopy('deepLink')}
                    ml={1}
                    variant="ghost"
                  />
                </Text>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="left"
                mt={2}
              >
                <Text fontSize="lg" fontWeight="normal">
                  <Link href={`${alternativeLink}_key-${aesKey}`} isExternal>
                    {alternativeLink}
                  </Link>
                  <IconButton
                    aria-label="Copy link"
                    icon={<CopyIcon />}
                    size="sm"
                    onClick={() => handleCopy('alternativeLink')}
                    ml={1}
                    variant="ghost"
                  />
                </Text>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {userPrincipal ? (
        <>
          <Text fontSize="lg" fontWeight="normal" mb={8}>
            You have been redirected to Telegram. Click here to close this tab:
          </Text>

          <Button colorScheme="blue" size="lg" onClick={() => window.close()}>
            Close
          </Button>

          <Text fontSize="lg" fontWeight="normal" mt={8}>
            If the redirection did not work try to open one of the links above
            manually in a browser.
          </Text>
        </>
      ) : (
        <>
          <Text fontSize="lg" fontWeight="normal" mb={8}>
            Click the button below to log in with Internet Identity.
          </Text>

          <Button colorScheme="blue" size="lg" onClick={handleClick}>
            Login
          </Button>
        </>
      )}

      <Box
        display="flex"
        flexDirection={{ base: 'column', md: 'row' }}
        justifyContent="center"
        alignItems="center"
        width="100%"
        margin="auto"
        mt={8}
        padding="16px"
        overflowX="auto"
        whiteSpace="nowrap"
      >
        <Image
          src={colorMode === 'dark' ? LogoLight : LogoDark}
          alt="DailyBid"
          height="64px"
          width="200px"
          mb={{ base: 4, md: 0 }}
        />
        <Image
          src={TelegramLogo}
          alt="Telegram"
          boxSize="55px"
          ml={{ base: 0, md: 4 }}
          mb={{ base: 4, md: 0 }}
        />
        <Image
          src={IILogo}
          alt="Internet Identity"
          height="64px"
          width="250px"
          ml={{ base: 0, md: 4 }}
        />
      </Box>
    </Box>
  )
}

export default LoginII
