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
import { Helmet } from 'react-helmet-async'

import { getInternetIdentityDerivationOrigin } from '../../utils/canisterUtils'
import { hexToByteArray } from '../../utils/convertionsUtils'

let appPublicKey: Ed25519PublicKey | null = null

function getSessionKeyFromQuery(): string {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('sessionKey') || ''
}

function getLoginDuration(): string {
  const savedValue = localStorage.getItem('selectedTimeLoginDurationInterval')

  const numericValue = savedValue ? Number(savedValue) : 0.5

  if (isNaN(numericValue)) return 'No value'

  if (numericValue <= 12) {
    return `${numericValue} hour${numericValue <= 1 ? '' : 's'}`
  } else {
    const days = numericValue / 24
    return `${days} day${days === 1 ? '' : 's'}`
  }
}

async function saveToDpasteWithAuth(content: any) {
  try {
    const API_TOKEN = process.env.ENV_DPASTE_API_KEY

    const response = await fetch('https://dpaste.com/api/v2/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        content,
        lexer: 'text',
        expiry_days: '1',
        visibility: 'private',
      }).toString(),
    })

    if (!response.ok) {
      throw new Error(`Failed to save to dpaste.com: ${response.statusText}`)
    }

    const result = await response.text()
    console.log('Saved to dpaste.com URL:', result)

    const code = new URL(result).pathname.replace('/', '')
    console.log('Extracted Code:', code)

    return code
  } catch (error) {
    console.error('Error saving to dpaste.com with auth:', error)
    throw error
  }
}

const LoginII: React.FC = () => {
  const [userPrincipal, setUserPrincipal] = useState('')
  const [delegationCode, setDelegationCode] = useState('')

  const deepLink = `tg://resolve?domain=daily_bid_bot&appname=gui&startapp=${delegationCode}`
  const alternativeLink = `https://t.me/daily_bid_bot/gui?startapp=${delegationCode}`

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

  const handleClick = async () => {
    let delegationChain

    const newTab = window.open('about:blank', '_blank')

    if (!newTab) {
      alert('Popup blocked! Please allow pop-ups and try again.')
      return
    }

    console.log('Tab opened:', newTab)

    const originalWindowOpen = window.open
    window.open = function (url, target) {
      console.log('Library tried to open:', url)
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
        24 * 60 * 60 * 1000 * 1000 * 1000,
      )

      await new Promise((resolve) => {
        authClient.login({
          maxTimeToLive: AUTH_EXPIRATION_INTERNET_IDENTITY,
          identityProvider: 'https://identity.ic0.app/#authorize',
          derivationOrigin: getInternetIdentityDerivationOrigin(),
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
            new Date(Date.now() + 15 * 60 * 1000), // 15 min
            { previous: middleIdentity.getDelegation() },
          )

          delegationChain = middleToApp
        } catch (error: any) {
          console.error('Failed to create delegation chain:', error.message)
        }
      }

      if (delegationChain) {
        const returnTo = 'tg://resolve?domain=daily_bid_bot&appname=gui'

        const delegationCodeDPaste = await saveToDpasteWithAuth(
          JSON.stringify(delegationChain),
        )

        setDelegationCode(delegationCodeDPaste)

        const miniAppUrl = `${returnTo}&startapp=${delegationCodeDPaste}`
        window.location.href = miniAppUrl
        newTab.close()
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
    <Box textAlign="center" width="100%" margin="auto">
      <Helmet title="DailyBid - Internet Identity Login" />
      <Heading as="h1" size="2xl" fontWeight="bold" mb={8}>
        Internet Identity
      </Heading>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mb={8}
        maxWidth="900px"
        width="100%"
        margin="auto"
        top="0"
        left="0"
        right="0"
        padding="16px"
        overflowX="auto"
        whiteSpace="nowrap"
      >
        <Box textAlign="right" pr={4} minWidth="150px">
          <Text fontSize="lg" fontWeight="normal">
            Derivation Origin:
          </Text>
          <Text fontSize="lg" fontWeight="normal">
            Duration (TTL):
          </Text>
          {userPrincipal && (
            <>
              <Text fontSize="lg" fontWeight="normal">
                User Principal:
              </Text>
              <Text fontSize="lg" fontWeight="normal">
                Deep Link:
              </Text>
              <Text fontSize="lg" fontWeight="normal">
                Alternative Link:
              </Text>
            </>
          )}
        </Box>

        <Box textAlign="left" pl={4} minWidth="250px">
          <Text fontSize="lg" fontWeight="normal">
            {getInternetIdentityDerivationOrigin()}
          </Text>
          <Text fontSize="lg" fontWeight="normal">
            {getLoginDuration()}
          </Text>
          {userPrincipal && (
            <>
              <Text fontSize="lg" fontWeight="normal">
                {userPrincipal}
              </Text>
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
            </>
          )}
        </Box>
      </Box>

      <Text fontSize="lg" fontWeight="normal" mb={8} mt={4}>
        Click the button below to log in with Internet Identity.
      </Text>

      <Button colorScheme="blue" size="lg" onClick={handleClick}>
        Login
      </Button>
    </Box>
  )
}

export default LoginII
