import { TokenApi } from '../types'

/**
 * Custom hook to fetch and manage cryptocurrency prices from CoinGecko API.
 */
const useCryptoPriceApi = () => {
  /**
   * Fetches cryptocurrency prices for a list of tokens.
   *
   * @returns A promise that resolves to an array of token metadata with prices.
   */
  const getCryptoPricesApi = async (): Promise<TokenApi[]> => {
    try {
      if (!process.env.ENV_CRYPTO_PRICES_API_TOKENS) {
        throw new Error('ENV_METAL_PRICES_API_TOKENS is not defined')
      }

      // Parse the tokens and their names from the environment variable
      const tokensWithNames =
        process.env.ENV_CRYPTO_PRICES_API_TOKENS.split(',')

      // API Key
      const apiKey = process.env.ENV_CRYPTO_API_KEY

      // Create a mapping of symbols to their names
      const tokenMap: Record<string, { id: string; name: string }> =
        tokensWithNames.reduce(
          (map, pair) => {
            const [id, symbol, name] = pair.split(':')
            map[symbol] = { id, name }
            return map
          },
          {} as Record<string, { id: string; name: string }>,
        )

      // Extract symbols from the token map
      const apiTokens = Object.values(tokenMap).map(({ id }) => id)

      const url = `https://api.coingecko.com/api/v3/simple/price?x_cg_demo_api_key=${apiKey}&ids=${apiTokens}&vs_currencies=usd`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching prices: ${response.statusText}`)
      }

      const prices = await response.json()

      return Object.entries(tokenMap).map(([symbol, { id, name }]) => ({
        symbol,
        name,
        timestamp: BigInt(Date.now()),
        value: prices[id]?.usd || 0,
      }))
    } catch (error) {
      console.error('Error fetching cryptocurrency prices:', error)
      return []
    }
  }

  /**
   * Fetches the list of all available tokens from CoinGecko API.
   *
   * @returns A promise that resolves to an array of token objects with their IDs, symbols, and names.
   */
  const getTokenListApi = async (): Promise<
    { id: string; symbol: string; name: string }[]
  > => {
    try {
      // API Key
      const apiKey = process.env.ENV_CRYPTO_API_KEY

      const url = `https://api.coingecko.com/api/v3/coins/list?x_cg_demo_api_key=${apiKey}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching token list: ${response.statusText}`)
      }

      const tokens = await response.json()
      return tokens as { id: string; symbol: string; name: string }[]
    } catch (error) {
      console.error('Error fetching token list:', error)
      return []
    }
  }

  return { getCryptoPricesApi, getTokenListApi }
}

export default useCryptoPriceApi
