import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent'

import { _SERVICE as Icrc84Actor } from '../../declarations/icrc1_auction/icrc1_auction.did'
import { idlFactory as Icrc84IDLFactory } from '../../declarations/icrc1_auction/icrc1_auction.did.js'

let actorCache: ActorSubclass<Icrc84Actor> | null = null
let userAgentCache: HttpAgent | null = null

/**
 * Creates and returns an actor for interacting with the auction canister.
 * Ensures that the actor is only recreated if the userAgent changes.
 * @param userAgent - The HTTP agent to be used for creating the actor.
 * @param canisterId - The principal ID of the ICRC aution canister.
 * @returns The created service actor.
 */
export function getActor(
  userAgent: HttpAgent,
  canisterId: string | null = null,
): ActorSubclass<Icrc84Actor> {
  if (!actorCache || userAgentCache !== userAgent || canisterId) {
    const auctionCanisterId = getAuctionCanisterId()
    userAgentCache = userAgent

    const principal = canisterId ? canisterId : auctionCanisterId

    actorCache = Actor.createActor<Icrc84Actor>(Icrc84IDLFactory, {
      agent: userAgent,
      canisterId: principal,
    })
  }

  return actorCache
}

/**
 * Retrieves the Auction Canister ID from localStorage, or falls back to a default value from environment variables.
 * @returns The Auction Canister ID, either retrieved from localStorage or the environment variable.
 */
export function getAuctionCanisterId() {
  const storageAuctionCanisterId = localStorage.getItem('auctionCanisterId')

  const auctionCanisterId = storageAuctionCanisterId
    ? storageAuctionCanisterId
    : `${process.env.CANISTER_ID_ICRC_AUCTION}`

  return auctionCanisterId
}

/**
 * Retrieves the Internet Identity Derivation Origin from localStorage, or falls back to a default value from environment variables.
 * @returns The Internet Identity Derivation Origin, either retrieved from localStorage or the environment variable.
 */
export function getInternetIdentityDerivationOrigin() {
  const storageAuctionDerivationOrigin = localStorage.getItem(
    'auctionDerivationOrigin',
  )

  const auctionDerivationOrigin = storageAuctionDerivationOrigin
    ? storageAuctionDerivationOrigin
    : `${process.env.ENV_AUTH_DERIVATION_ORIGIN}`

  return auctionDerivationOrigin
}
