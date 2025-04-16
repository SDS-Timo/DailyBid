import { HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import { DataItem, Option, TokenMetadata, TokenDataItem } from '../types'
import {
  convertPriceFromCanister,
  convertVolumeFromCanister,
  getDecimals,
  addDecimal,
} from '../utils/calculationsUtils'
import { getActor } from '../utils/canisterUtils'
import { getToken } from '../utils/tokenUtils'

// Date formatting options
const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
}

/**
 * Formats a timestamp into standardized date and time strings
 * @param timestamp - Timestamp in nanoseconds
 * @returns Object containing formatted datetime, date and time strings
 */
const formatDateAndTime = (timestamp: bigint) => {
  const date = new Date(Number(timestamp) / 1_000_000)
  return {
    datetime: date.toLocaleDateString('en-US', DATE_TIME_OPTIONS),
    date: date.toLocaleDateString('en-US', DATE_OPTIONS),
    time: date.toLocaleTimeString('en-US', TIME_OPTIONS),
  }
}

/**
 * Processes price and volume data for token items
 * @param price - Raw price from canister
 * @param volume - Raw volume from canister
 * @param token - Token metadata
 * @param quoteToken - Quote token metadata
 * @returns Formatted price and volume data
 */
const processTokenValues = (
  price: number,
  volume: number,
  token: TokenMetadata,
  quoteToken: TokenMetadata,
) => {
  const formattedPrice = convertPriceFromCanister(
    price,
    token.decimals,
    quoteToken.decimals,
  )

  const { volumeInQuote, volumeInBase } = convertVolumeFromCanister(
    volume,
    token.decimals,
    formattedPrice,
  )

  return {
    price: formattedPrice,
    volumeInQuote,
    volumeInBase,
  }
}

/**
 * Custom hook for making unified queries to the auction canister.
 */
const useAuctionQuery = () => {
  /**
   * Processes price history data from canister response
   */
  const processPriceHistory = (
    priceData: any[],
    selectedSymbol: Option,
    selectedQuote: TokenMetadata,
    priceDigitsLimit: number,
  ): DataItem[] => {
    return priceData
      .filter((_priceData) => Number(_priceData[4]) !== 0)
      .map((priceData, index) => {
        const ts = priceData[0]
        const volume = priceData[3]
        const price = priceData[4]
        const dateInfo = formatDateAndTime(ts)
        const values = processTokenValues(
          Number(price),
          Number(volume),
          {
            decimals: getDecimals(selectedSymbol),
          } as TokenMetadata,
          selectedQuote,
        )

        return {
          id: BigInt(index),
          ...dateInfo,
          ...values,
          volume: values.volumeInBase,
          quoteDecimals: selectedQuote.decimals,
          priceDigitsLimit,
        }
      })
  }

  /**
   * Processes orders (bids and asks) from canister response
   */
  const processOrders = (
    bidsRaw: any[],
    asksRaw: any[],
    tokens: TokenMetadata[],
    selectedQuote: TokenMetadata,
    priceDigitsLimit: number,
  ): TokenDataItem[] => {
    const openOrdersRaw = [
      ...bidsRaw.map((bid) => ({
        id: bid[0],
        ...bid[1],
        type: 'buy',
      })),
      ...asksRaw.map((ask) => ({
        id: ask[0],
        ...ask[1],
        type: 'sell',
      })),
    ]

    return openOrdersRaw.map((order) => {
      const { id, icrc1Ledger, price, volume, type } = order
      const token = getToken(tokens, icrc1Ledger)
      const values = processTokenValues(
        Number(price),
        Number(volume),
        token,
        selectedQuote,
      )

      return {
        id,
        datetime: '',
        ...values,
        type,
        volume: values.volumeInQuote,
        quoteDecimals: selectedQuote.decimals,
        baseDecimals: token.decimals,
        priceDigitsLimit,
        ...token,
      }
    })
  }

  /**
   * Processes transaction history from canister response
   */
  const processTransactionHistory = (
    transactions: any[],
    tokens: TokenMetadata[],
    selectedQuote: TokenMetadata,
    priceDigitsLimit: number,
  ): TokenDataItem[] => {
    return transactions.map((transaction, index) => {
      const ts = transaction[0]
      const kind = transaction[2]
      const tokenPrincipal = transaction[3]
      const volume = transaction[4]
      const price = transaction[5]

      const dateInfo = formatDateAndTime(ts)
      const token = getToken(tokens, tokenPrincipal)
      const values = processTokenValues(
        Number(price),
        Number(volume),
        token,
        selectedQuote,
      )

      return {
        id: BigInt(index),
        ...dateInfo,
        ...values,
        type: 'bid' in kind ? 'buy' : 'sell',
        volume: values.volumeInQuote,
        quoteDecimals: selectedQuote.decimals,
        baseDecimals: token.decimals,
        priceDigitsLimit,
        ...token,
      }
    })
  }

  /**
   * Processes deposit history from canister response
   */
  const processDepositHistory = (histories: any[], tokens: TokenMetadata[]) => {
    return histories.map((deposit, index) => {
      const ts = deposit[0]
      const actionObj = deposit[1]
      const tokenPrincipal = deposit[2]
      const volume = deposit[3]

      const dateInfo = formatDateAndTime(ts)
      const action = Object.keys(actionObj)[0]
      const token = getToken(tokens, tokenPrincipal)
      const { volumeInBase } = convertVolumeFromCanister(
        Number(volume),
        token.decimals,
        0,
      )

      return {
        id: BigInt(index),
        datetime: dateInfo.datetime,
        price: 0,
        volume: volumeInBase,
        volumeInBase,
        volumeInQuote: 0,
        action,
        ...token,
      }
    })
  }

  /**
   * Processes credit data from canister response
   */
  const processCredits = (
    credits: any[],
    tokens: TokenMetadata[],
  ): TokenDataItem[] => {
    const creditsMap = (credits ?? []).reduce(
      (acc, [principal, credit]) => {
        acc[principal.toText()] = credit
        return acc
      },
      {} as Record<string, any>,
    )

    return tokens.map((token, index) => {
      const principal = token.principal || ''
      const credit = creditsMap[principal] || {
        available: 0,
        locked: 0,
        total: 0,
      }

      const { volumeInBase: volumeInAvailable } = convertVolumeFromCanister(
        Number(credit.available),
        getDecimals(token),
        0,
      )

      const { volumeInBase: volumeInLocked } = convertVolumeFromCanister(
        Number(credit.locked),
        token.decimals,
        0,
      )

      const { volumeInBase: volumeInTotal } = convertVolumeFromCanister(
        Number(credit.total),
        token.decimals,
        0,
      )

      return {
        id: BigInt(index),
        datetime: '',
        price: 0,
        volume: 0,
        volumeInQuote: 0,
        volumeInBase: volumeInAvailable,
        volumeInAvailable,
        volumeInAvailableNat: String(credit.available),
        volumeInLocked,
        volumeInLockedNat: String(credit.locked),
        volumeInTotal,
        volumeInTotalNat: String(credit.total),
        ...token,
      }
    })
  }

  /**
   * Processes last prices data from canister response
   */
  const processLastPrices = (
    lastPrices: any[],
    tokens: TokenMetadata[],
    selectedQuote: TokenMetadata,
    priceDigitsLimit: number,
  ): TokenDataItem[] => {
    return lastPrices.map(
      ([timestamp, sessionNumber, tokenPrincipal, volume, price], index) => {
        const dateInfo = formatDateAndTime(timestamp)
        const token = getToken(tokens, tokenPrincipal)
        const values = processTokenValues(
          Number(price),
          Number(volume),
          token,
          selectedQuote,
        )

        return {
          id: BigInt(index),
          ...dateInfo,
          ...values,
          volume: values.volumeInBase,
          quoteDecimals: selectedQuote.decimals,
          baseDecimals: token.decimals,
          sessionNumber: Number(sessionNumber),
          priceDigitsLimit,
          ...token,
        }
      },
    )
  }

  /**
   * Fetches and returns data based on requested query types.
   *
   * @param userAgent - The HTTP agent to interact with the canister.
   * @param queryOptions - Configuration options for the queries.
   * @param queryOptions.selectedSymbol - The selected token option.
   * @param queryOptions.selectedQuote - The selected token metadata for quote currency.
   * @param queryOptions.priceDigitsLimit - The limit number of digits places defined by the canister.
   * @param queryOptions.tokens - Array of token objects for multi-token queries.
   * @param queryOptions.queryTypes - Array of query types to include in the request.
   *        Available types:
   *          - 'price_history' (requires selectedSymbol, selectedQuote) - returns as pricesHistory
   *          - 'transaction_history' (requires tokens, selectedQuote) - returns as trades
   *          - 'deposit_history' (requires tokens) - returns as depositHistory
   *          - 'bids' (requires tokens, selectedQuote) - combined with 'asks' in orders
   *          - 'asks' (requires tokens, selectedQuote) - combined with 'bids' in orders
   *          - 'session_numbers' - returns as sessionNumbers
   *          - 'credits' (requires tokens) - returns as credits
   *          - 'last_prices' (requires tokens, selectedQuote) - returns as lastPrices
   * @returns A promise that resolves to an object with requested data.
   *          The response object may contain the following properties based on queryTypes:
   *          - pricesHistory: DataItem[] - Price history data
   *          - trades: TokenDataItem[] - Transaction history data
   *          - depositHistory: TokenDataItem[] - Deposit history data
   *          - orders: TokenDataItem[] - Combined bids and asks data
   *          - sessionNumbers: Record<string, bigint> - Session numbers per token
   *          - credits: TokenDataItem[] - Credits data
   *          - lastPrices: TokenDataItem[] - Last prices data
   */
  const getQuerys = async (
    userAgent: HttpAgent,
    queryOptions: {
      selectedSymbol?: Option
      selectedQuote?: TokenMetadata
      priceDigitsLimit?: number
      tokens?: TokenMetadata[]
      queryTypes: string[]
    },
  ) => {
    try {
      const {
        selectedSymbol,
        selectedQuote,
        priceDigitsLimit = 0,
        tokens = [],
        queryTypes,
      } = queryOptions

      const principal = selectedSymbol?.principal
      const serviceActor = getActor(userAgent)

      // Prepare query parameters
      const queryParams: any = {
        last_prices: [],
        credits: [],
        asks: [],
        bids: [],
        session_numbers: [],
        transaction_history: [],
        reversed_history: [true],
        price_history: [],
        deposit_history: [],
      }

      // Enable requested query types
      if (queryTypes.includes('price_history')) {
        queryParams.price_history = [[BigInt(10000), BigInt(0), true]]
      }

      if (queryTypes.includes('transaction_history')) {
        queryParams.transaction_history = [[BigInt(10000), BigInt(0)]]
      }

      if (queryTypes.includes('deposit_history')) {
        queryParams.deposit_history = [[BigInt(10000), BigInt(0)]]
      }

      if (queryTypes.includes('open_orders')) {
        queryParams.bids = [true]
        queryParams.asks = [true]
      }

      if (queryTypes.includes('session_numbers')) {
        queryParams.session_numbers = [true]
      }

      if (queryTypes.includes('credits')) {
        queryParams.credits = [true]
      }

      if (queryTypes.includes('last_prices')) {
        queryParams.last_prices = [true]
      }

      // Make the canister query
      const principalParam = principal ? [Principal.fromText(principal)] : []
      const result = await serviceActor.auction_query(
        principalParam,
        queryParams,
      )

      // Process the results based on requested query types
      const response: any = {}
      response.points = result.points

      // Process price history if requested
      if (
        queryTypes.includes('price_history') &&
        selectedSymbol &&
        selectedQuote
      ) {
        const formattedData = processPriceHistory(
          result.price_history || [],
          selectedSymbol,
          selectedQuote,
          priceDigitsLimit,
        )
        response.pricesHistory = addDecimal(formattedData, 2)
      }

      // Process order data (bids and asks) if requested
      if (
        queryTypes.includes('open_orders') &&
        selectedQuote &&
        tokens.length > 0
      ) {
        const openOrders = processOrders(
          result.bids || [],
          result.asks || [],
          tokens,
          selectedQuote,
          priceDigitsLimit,
        )

        response.orders = addDecimal(openOrders, 2)
      }

      // Process transaction history if requested
      if (
        queryTypes.includes('transaction_history') &&
        selectedQuote &&
        tokens.length > 0
      ) {
        const formattedData = processTransactionHistory(
          result.transaction_history || [],
          tokens,
          selectedQuote,
          priceDigitsLimit,
        )

        response.trades = addDecimal(formattedData, 2)
      }

      // Process deposit history if requested
      if (queryTypes.includes('deposit_history') && tokens.length > 0) {
        const formattedData = processDepositHistory(
          result.deposit_history || [],
          tokens,
        )

        response.depositHistory = formattedData
      }

      // Process session numbers if requested
      if (queryTypes.includes('session_numbers')) {
        const sessionNumbers = result.session_numbers || []
        const formattedSessionNumbers: Record<string, bigint> = {}

        sessionNumbers.forEach(([token, sessionNumber]: [any, bigint]) => {
          formattedSessionNumbers[token.toString()] = sessionNumber
        })

        response.sessionNumbers = formattedSessionNumbers
      }

      // Process credits if requested
      if (queryTypes.includes('credits') && tokens.length > 0) {
        const formattedCredits = processCredits(result.credits || [], tokens)
        const data = addDecimal(formattedCredits, 4)
        data.sort((a, b) => a.symbol.localeCompare(b.symbol))

        response.credits = data
      }

      // Process last prices if requested
      if (
        queryTypes.includes('last_prices') &&
        tokens.length > 0 &&
        selectedQuote
      ) {
        const formattedLastPrices = processLastPrices(
          result.last_prices || [],
          tokens,
          selectedQuote,
          priceDigitsLimit,
        )

        response.lastPrices = addDecimal(formattedLastPrices, 2)
      }

      return response
    } catch (error) {
      console.error('Error in auction query:', error)
      return {}
    }
  }

  return { getQuerys }
}

export default useAuctionQuery
