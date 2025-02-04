import React, { useState } from 'react'

import { CopyIcon } from '@chakra-ui/icons'
import {
  Button,
  Heading,
  Text,
  Box,
  Link,
  IconButton,
  useClipboard,
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

import customStyles from '../../common/styles'
import useDPasteApi from '../../hooks/useDpasteApi'
import { Option } from '../../types'
import { getInternetIdentityDerivationOrigin } from '../../utils/canisterUtils'
import { hexToByteArray } from '../../utils/convertionsUtils'

let appPublicKey: Ed25519PublicKey | null = null

function getSessionKeyFromQuery(): string {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('sessionKey') || ''
}

const LoginII: React.FC = () => {
  const [userPrincipal, setUserPrincipal] = useState('')
  const [delegationCode, setDelegationCode] = useState('')
  const [selectedTime, setSelectedTime] = useState<Option | null>({
    id: '720',
    value: '720',
    label: '30d',
  })

  const { saveToDpasteWithAuth } = useDPasteApi()

  const deepLink = `${process.env.ENV_TELEGRAM_DEEP_LINK}&startapp=${delegationCode}`
  const alternativeLink = `${process.env.ENV_TELEGRAM_ALTERNATIVE_LINK}?startapp=${delegationCode}`

  const { onCopy: onCopyDeepLink } = useClipboard(deepLink)
  const { onCopy: onCopyAltLink } = useClipboard(alternativeLink)

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
    { id: '1', value: '1', label: '1h' },
    { id: '3', value: '3', label: '3h' },
    { id: '12', value: '12', label: '12h' },
    { id: '24', value: '24', label: '1d' },
    { id: '168', value: '168', label: '7d' },
    { id: '720', value: '720', label: '30d' },
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

        const delegationCodeDPaste = await saveToDpasteWithAuth(
          JSON.stringify(delegationChain),
        )

        setDelegationCode(delegationCodeDPaste)

        const miniAppUrl = `${returnTo}&startapp=${delegationCodeDPaste}`

        window.location.href = miniAppUrl

        window.onblur = () => {
          window.onfocus = () => {
            setTimeout(() => window.close(), 1000)
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
    <Box textAlign="center" width="100%">
      <Helmet title="DailyBid - Internet Identity Login" />
      <Heading as="h1" size="2xl" fontWeight="bold" mb={8}>
        Internet Identity
      </Heading>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        mb={8}
        maxWidth="900px"
        minH="315px"
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
                  <Link href={deepLink} isExternal>
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
                  <Link href={alternativeLink} isExternal>
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
        <Text fontSize="lg" fontWeight="normal" mb={8} mt={4}>
          You have been redirected to Telegram. If the redirection did not work
          try to open one of the links above in a browser manually.
        </Text>
      ) : (
        <>
          <Text fontSize="lg" fontWeight="normal" mb={8} mt={4}>
            Click the button below to log in with Internet Identity.
          </Text>

          <Button colorScheme="blue" size="lg" onClick={handleClick}>
            Login
          </Button>
        </>
      )}
    </Box>
  )
}

export default LoginII
