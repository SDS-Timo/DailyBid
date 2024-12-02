import { HttpAgent } from '@dfinity/agent'

import { TokenMetadata } from '../types'
import { getActorMetalPriceApi } from '../utils/canisterMetalPriceApiUtils'
import { getToken } from '../utils/tokenUtils'

/**
 * Custom hook for fetching and managing prices from metal price api.
 */
const useMetalPriceApi = () => {
  /**
   * Fetches the price in real time and maps token data with corresponding prices.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token metadata.
   * @returns - A promise that resolves to an array of enriched token metadata with prices.
   */
  const getMetalPriceApi = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
  ): Promise<TokenMetadata[]> => {
    try {
      if (!process.env.ENV_METAL_PRICES_API_TOKENS) {
        throw new Error('ENV_METAL_PRICES_API_TOKENS is not defined')
      }

      if (!tokens || tokens.length === 0) return []

      // Parse the tokens from the environment variable
      const apiTokens = process.env.ENV_METAL_PRICES_API_TOKENS.split(',')

      // Map tokens to USD-prefixed symbols and metadata objects
      const usdTokens = apiTokens.map((token) => `USD${token}`)
      const tokenObjects = apiTokens.map((token) =>
        getToken(tokens, undefined, token),
      )

      // Initialize the service actor and fetch prices
      const serviceActor = getActorMetalPriceApi(userAgent)
      const prices = await serviceActor.queryRates(usdTokens)

      // Map prices back to their corresponding token metadata
      const enrichedTokenObjects = tokenObjects.map((tokenObject, index) => {
        const priceData = prices[index]?.['0']
        return {
          ...tokenObject,
          syncTimestamp: priceData ? priceData.syncTimestamp : 0n,
          value: priceData ? priceData.value : 0,
        }
      })
      return enrichedTokenObjects
    } catch (error) {
      console.error('Error fetching metal price API:', error)
      return []
    }
  }

  return { getMetalPriceApi }
}

export default useMetalPriceApi
