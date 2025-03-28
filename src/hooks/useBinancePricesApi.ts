/**
 * Custom hook to fetch and manage cryptocurrency prices from Binance API.
 */
const useBinancePricesApi = () => {
  /**
   * Fetches token data from Binance API.
   *
   * @param tokensDetails - Array of tokens in the format [{ name, symbol }]
   * @returns A promise that resolves to an array of token price data.
   */
  const getBinancePricesData = async (
    tokensDetails: { name: string; symbol: string }[],
  ) => {
    try {
      if (!tokensDetails?.length) {
        throw new Error('Tokens array is not provided or empty')
      }

      const quoteToken = process.env.ENV_TOKEN_QUOTE_DEFAULT || 'USDT'

      const tokenInfo = tokensDetails.map((t) => ({
        ...t,
        baseToken: t.symbol.toUpperCase(),
        symbol: `${t.symbol.toUpperCase()}${quoteToken}`,
      }))

      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price',
      )

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`)
      }

      const data = await response.json()

      return data
        .filter((item: { symbol: string }) =>
          tokenInfo.some((t) => t.symbol === item.symbol),
        )
        .map((item: { symbol: string; price: string }) => {
          const t = tokenInfo.find((token) => token.symbol === item.symbol)!

          return {
            symbol: item.symbol,
            baseToken: t.baseToken,
            name: t.name,
            value: item.price,
            timestamp: BigInt(Date.now()),
          }
        })
    } catch (err) {
      console.error('Error fetching Binance data:', err)
      return []
    }
  }

  return { getBinancePricesData }
}

export default useBinancePricesApi
