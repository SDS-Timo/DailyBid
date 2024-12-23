import { HttpAgent, Identity } from '@dfinity/agent'
import { AuthClient } from '@dfinity/auth-client'
import { Ed25519KeyIdentity } from '@dfinity/identity'
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1'

import { getUserDepositAddress } from './convertionsUtils'
import { AppDispatch } from '../store'
import { getInternetIdentityDerivationOrigin } from './canisterUtils'
import {
  setUserAgent,
  setIsAuthenticated,
  setUserPrincipal,
  setUserDeposit,
} from '../store/auth'

/**
 * Creates and returns an HTTP agent with the specified identity.
 * @param identity - The identity to be used for the agent.
 * @returns The created HTTP agent.
 */
export function getAgent(identity: Identity) {
  const HTTP_AGENT_HOST = `${process.env.HTTP_AGENT_HOST}`

  const myAgent = HttpAgent.createSync({
    identity,
    host: HTTP_AGENT_HOST,
    retryTimes: 10,
  })

  return myAgent
}

/**
 * Performs the login process by dispatching actions to set the user agent and authentication status.
 * @param myAgent - The HTTP agent to be used for the login process.
 * @param dispatch - The dispatch function to trigger actions in the Redux store.
 */
async function doLogin(myAgent: HttpAgent, dispatch: AppDispatch) {
  dispatch(setUserAgent(myAgent))
  dispatch(setIsAuthenticated(true))

  const principal = await myAgent.getPrincipal()
  dispatch(setUserPrincipal(principal.toText()))
  dispatch(setUserDeposit(getUserDepositAddress(principal.toText())))
}

/**
 * Authenticates the user using a seed phrase and dispatches actions to set the user agent and authentication status.
 * @param seed - The seed phrase to generate the identity.
 * @param dispatch - The dispatch function to trigger actions in the Redux store.
 */
export async function seedAuthenticate(seed: string, dispatch: AppDispatch) {
  try {
    if (seed.length === 0 || seed.length > 32) return

    const seedToIdentity: (seed: string) => Identity | null = (seed) => {
      const seedBuf = new Uint8Array(new ArrayBuffer(32))
      seedBuf.set(new TextEncoder().encode(seed))
      return Ed25519KeyIdentity.generate(seedBuf)
    }

    const newIdentity = seedToIdentity(seed)

    if (newIdentity) {
      const myAgent = getAgent(newIdentity)
      await doLogin(myAgent, dispatch)
    }
  } catch (error) {
    console.error('Error during seed authentication:', error)
  }
}

/**
 * Authenticates the user using an internet identity or another authentication network and dispatches actions
 * to set the user agent and authentication status.
 * @param dispatch - The dispatch function to trigger actions in the Redux store.
 * @param AuthNetworkTypes - The authentication network type to use, either 'IC' (Internet Computer) or 'NFID'.
 */
export async function identityAuthenticate(
  dispatch: AppDispatch,
  AuthNetworkTypes: 'IC' | 'NFID',
): Promise<void> {
  try {
    const authClient = await AuthClient.create()
    const HTTP_AGENT_HOST =
      AuthNetworkTypes === 'IC'
        ? `${process.env.HTTP_AGENT_HOST}`
        : `${process.env.HTTP_AGENT_HOST_NFID}`

    const selectedTime = localStorage.getItem(
      'selectedTimeLoginDurationInterval',
    )
    const expirationHours = selectedTime ? parseFloat(selectedTime) : 0.5

    const AUTH_EXPIRATION_INTERNET_IDENTITY = BigInt(
      expirationHours * 60 * 60 * 1000 * 1000 * 1000,
    )

    let windowFeatures = undefined
    const isDesktop = window.innerWidth > 768
    if (isDesktop) {
      const width = 500
      const height = 600
      const left = window.screenX + (window.innerWidth - width) / 2
      const top = window.screenY + (window.innerHeight - height) / 2
      windowFeatures = `left=${left},top=${top},width=${width},height=${height}`
    }

    await authClient.login({
      maxTimeToLive: AUTH_EXPIRATION_INTERNET_IDENTITY,
      identityProvider: HTTP_AGENT_HOST,
      derivationOrigin: getInternetIdentityDerivationOrigin(),
      windowOpenerFeatures: windowFeatures,
      onSuccess: async () => {
        const identity = authClient.getIdentity()
        const myAgent = getAgent(identity)
        await doLogin(myAgent, dispatch)
      },
      onError: (error) => {
        AuthNetworkTypes === 'IC'
          ? console.error('Internet Identity authentication failed', error)
          : console.error('NFID authentication failed', error)
      },
    })
  } catch (error) {
    console.error('Unexpected error during authentication process', error)
  }
}

/**
 * Authenticates a user using a mnemonic seed phrase.
 * @param phrase - An array of words representing the mnemonic seed phrase.
 * @param dispatch - The dispatch function to trigger actions in the Redux store.
 */
export const mnemonicAuthenticate = async (
  phrase: string[],
  dispatch: AppDispatch,
): Promise<void> => {
  try {
    const createIdentity = (seedPhrase: string[]): Identity | null => {
      try {
        return Secp256k1KeyIdentity.fromSeedPhrase(seedPhrase) as Identity
      } catch (error) {
        console.error('Error creating identity from seed phrase:', error)
        return null
      }
    }

    const newIdentity = createIdentity(phrase)

    if (!newIdentity) {
      throw new Error(
        'Failed to generate identity from the provided seed phrase.',
      )
    }

    const myAgent = getAgent(newIdentity)

    await doLogin(myAgent, dispatch)
  } catch (error) {
    console.error('Authentication failed:', error)
  }
}
