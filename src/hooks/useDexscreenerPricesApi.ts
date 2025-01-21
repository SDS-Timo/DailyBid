/**
 * Custom hook to fetch and manage cryptocurrency prices from Dexscreener API.
 */
const useDexscreenerPricesApi = () => {
  /**
   * Fetches token data from Dexscreener API.
   *
   * @param tokensDetails - The tokens configuration string.
   * @returns A promise that resolves to an object with token data keyed by symbol.
   */
  const getDexscreenerPricesData = async (tokensDetails: string) => {
    try {
      if (!tokensDetails) {
        throw new Error('Tokens configuration string is not provided')
      }

      // Parse tokens with their symbol, name, chainId and pairId from the input string
      const tokensWithDetails = tokensDetails.split(',')

      // Map to store token details
      const tokenMap = tokensWithDetails.reduce(
        (
          map: {
            [key: string]: { name: string; chainId: string; pairId: string }
          },
          entry,
        ) => {
          const [symbol, name, chainId, pairId] = entry.split(':')
          map[symbol] = { name, chainId, pairId }
          return map
        },
        {},
      )

      // Extract chainId from the first token and combine pairIds
      const { chainId } = Object.values(tokenMap)[0]
      const pairIds = Object.values(tokenMap)
        .map(({ pairId }) => pairId)
        .join(',')

      // Build the URL
      const url = `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairIds}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`)
      }

      const data = await response.json()

      // Combine results into a single object
      return data.pairs.reduce((acc: { [key: string]: any }, pair: any) => {
        const {
          baseToken,
          quoteToken,
          priceUsd,
          chainId,
          dexId,
          url,
          pairAddress,
        } = pair

        const symbol = baseToken.symbol
        const name = tokenMap[symbol]?.name || baseToken.name

        acc[symbol] = {
          name,
          chainId,
          dexId,
          url,
          pairAddress,
          baseToken,
          quoteToken,
          value: priceUsd,
          timestamp: BigInt(Date.now()),
        }
        return acc
      }, {})
    } catch (err) {
      console.error('Error fetching Dexscreener data:', err)
      return {}
    }
  }
  return { getDexscreenerPricesData }
}

export default useDexscreenerPricesApi
