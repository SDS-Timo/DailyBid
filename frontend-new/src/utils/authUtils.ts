import { Actor, HttpAgent, Identity } from '@dfinity/agent'
import { Ed25519KeyIdentity } from '@dfinity/identity'

import { _SERVICE as IcrcxActor } from '../../../declarations/icrc1_auction/icrc1_auction.did'
import { idlFactory as IcrcxIDLFactory } from '../../../declarations/icrc1_auction/icrc1_auction.did.js'
import { AppDispatch } from '../store'
import { setUserAgent, setIsAuthenticated, setIsPrincipal } from '../store/auth'

/**
 * Creates and returns an actor for interacting with the auction canister.
 * @param userAgent - The HTTP agent to be used for creating the actor.
 * @returns The created service actor.
 */
export function getActor(userAgent: HttpAgent) {
  const serviceActor = Actor.createActor<IcrcxActor>(IcrcxIDLFactory, {
    agent: userAgent,
    canisterId: `${process.env.CANISTER_ID_ICRC_AUCTION}`,
  })

  return serviceActor
}

/**
 * Creates and returns an HTTP agent with the specified identity.
 * @param identity - The identity to be used for the agent.
 * @returns The created HTTP agent.
 */
export function getAgent(identity: Identity) {
  const HTTP_AGENT_HOST = `${process.env.HTTP_AGENT_HOST}`

  const myAgent = new HttpAgent({
    identity,
    host: HTTP_AGENT_HOST,
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
  dispatch(setIsPrincipal(principal.toText()))
}

/**
 * Formats a wallet address by displaying the first 4 characters,
 * followed by ellipsis (...), and the last 3 characters.
 *
 * @param {string} address - The wallet address to format.
 * @returns {string} The formatted wallet address.
 */
export function formatWalletAddress(address: string): string {
  if (address.length <= 9) {
    return address
  }
  return `${address.slice(0, 4)}...${address.slice(-3)}`
}

/**
 * Authenticates the user using a seed phrase and dispatches actions to set the user agent and authentication status.
 * @param seed - The seed phrase to generate the identity.
 * @param dispatch - The dispatch function to trigger actions in the Redux store.
 */
export async function seedAuthenticate(seed: string, dispatch: AppDispatch) {
  if (seed.length === 0 || seed.length > 32) return

  const seedToIdentity: (seed: string) => Identity | null = (seed) => {
    const seedBuf = new Uint8Array(new ArrayBuffer(32))
    seedBuf.set(new TextEncoder().encode(seed))
    return Ed25519KeyIdentity.generate(seedBuf)
  }

  const newIdentity = seedToIdentity(seed)

  if (newIdentity) {
    const myAgent = getAgent(newIdentity)
    doLogin(myAgent, dispatch)
  }
}