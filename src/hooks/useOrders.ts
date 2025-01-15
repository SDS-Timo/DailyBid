import { HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

import {
  TokenDataItem,
  TokenMetadata,
  Option,
  Order,
  SettingsState,
} from '../types'
import {
  convertPriceFromCanister,
  convertVolumeFromCanister,
  addDecimal,
} from '../utils/calculationsUtils'
import { getActor } from '../utils/canisterUtils'
import { getToken } from '../utils/tokenUtils'

/**
 * Custom hook for managing orders.
 */
const useOrders = () => {
  /**
   * Fetches and returns the open orders.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param tokens - An array of token objects.
   * @param selectedQuote - The selected token metadata for the quote currency.
   * @param priceDigitsLimit - The limit number of digits places defined by the canister
   * @returns A promise that resolves to an array of open TokenDataItem orders.
   */
  const getOpenOrders = async (
    userAgent: HttpAgent,
    tokens: TokenMetadata[],
    selectedQuote: TokenMetadata,
    priceDigitsLimit: number,
  ): Promise<TokenDataItem[]> => {
    try {
      if (!tokens || tokens.length === 0) return []

      const serviceActor = getActor(userAgent)

      const [bidsRaw, asksRaw] = await Promise.all([
        serviceActor.queryBids(),
        serviceActor.queryAsks(),
      ])

      const openOrdersRaw = [
        ...bidsRaw.map(([id, bid, sessionNumber]) => ({
          ...bid,
          id,
          sessionNumber,
          type: 'buy',
        })),
        ...asksRaw.map(([id, ask, sessionNumber]) => ({
          ...ask,
          id,
          sessionNumber,
          type: 'sell',
        })),
      ]

      const openOrders: TokenDataItem[] = (openOrdersRaw ?? []).map((order) => {
        const { id, icrc1Ledger, price, volume, type } = order

        const token = getToken(tokens, icrc1Ledger)

        const formattedPrice = convertPriceFromCanister(
          Number(price),
          token.decimals,
          selectedQuote.decimals,
        )

        const { volumeInQuote, volumeInBase } = convertVolumeFromCanister(
          Number(volume),
          token.decimals,
          formattedPrice,
        )

        return {
          id,
          datetime: '',
          price: formattedPrice,
          type,
          volume: volumeInQuote,
          volumeInQuote,
          volumeInBase,
          quoteDecimals: selectedQuote.decimals,
          baseDecimals: token.decimals,
          priceDigitsLimit,
          ...token,
        }
      })

      const data = addDecimal(openOrders, 2)

      return data
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  /**
   * Fetches and returns the order settings.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param selectedQuote - The selected token metadata for the quote currency.
   * @returns A promise that resolves to a order settings.
   */
  const getOrderSettings = async (
    userAgent: HttpAgent,
    selectedQuote: TokenMetadata,
  ): Promise<SettingsState> => {
    try {
      const serviceActor = getActor(userAgent)

      const {
        orderQuoteVolumeMinimum,
        orderPriceDigitsLimit,
        orderQuoteVolumeStep,
      } = await serviceActor.settings()

      const { volumeInBase: minimumOrderSize } = convertVolumeFromCanister(
        Number(orderQuoteVolumeMinimum),
        selectedQuote.decimals,
        0,
      )

      const { volumeInBase: stepSize } = convertVolumeFromCanister(
        Number(orderQuoteVolumeStep),
        selectedQuote.decimals,
        0,
      )

      return {
        orderQuoteVolumeMinimum: minimumOrderSize,
        orderQuoteVolumeMinimumNat: String(orderQuoteVolumeMinimum),
        orderPriceDigitsLimit: Number(orderPriceDigitsLimit),
        orderPriceDigitsLimitNat: String(orderPriceDigitsLimit),
        orderQuoteVolumeStep: stepSize,
        orderQuoteVolumeStepNat: String(orderQuoteVolumeStep),
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      return {
        orderQuoteVolumeMinimum: 0,
        orderQuoteVolumeMinimumNat: '0',
        orderPriceDigitsLimit: 0,
        orderPriceDigitsLimitNat: '0',
        orderQuoteVolumeStep: 0,
        orderQuoteVolumeStepNat: '0',
      }
    }
  }

  /**
   * Places an order on the canister.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param selectedSymbol - The selected token option, which may include the principal.
   * @param order - The order details including volume, price, and type.
   * @returns A promise that resolves to the result of the order placement.
   */
  const placeOrder = async (
    userAgent: HttpAgent,
    selectedSymbol: Option | null,
    order: Order,
  ) => {
    try {
      const serviceActor = getActor(userAgent)

      const principal = Array.isArray(selectedSymbol)
        ? selectedSymbol[0]?.principal
        : selectedSymbol?.principal

      let result

      if (order.type === 'buy') {
        result = await serviceActor.placeBids(
          [
            [
              Principal.fromText(principal),
              BigInt(order.volumeInBase),
              Number(order.price),
            ],
          ],
          [],
        )
      } else {
        result = await serviceActor.placeAsks(
          [
            [
              Principal.fromText(principal),
              BigInt(order.volumeInBase),
              Number(order.price),
            ],
          ],
          [],
        )
      }

      return result
    } catch (error) {
      console.error('Error place order:', error)
      return []
    }
  }

  /**
   * Replaces an existing order (bid or ask) in the market.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param order - The order object containing details about the order to be replaced.
   * @returns - Returns the result of the replace operation from the service actor.
   */
  const replaceOrder = async (userAgent: HttpAgent, order: Order) => {
    try {
      const serviceActor = getActor(userAgent)

      let result

      if (order.type === 'buy') {
        result = await serviceActor.replaceBid(
          BigInt(order.id),
          BigInt(order.volumeInBase),
          Number(order.price),
          [],
        )
      } else {
        result = await serviceActor.replaceAsk(
          BigInt(order.id),
          BigInt(order.volumeInBase),
          Number(order.price),
          [],
        )
      }

      return result
    } catch (error) {
      console.error('Error replace order:', error)
      return []
    }
  }

  /**
   * Cancels an order based on its type and ID.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @param id - The ID of the order to be cancelled. Must be a bigint.
   * @param type - The type of the order to be cancelled, either 'buy' or 'sell'.
   * @returns A promise that resolves to the result of the cancellation operation.
   */
  const cancelOrder = async (
    userAgent: HttpAgent,
    id: bigint | undefined,
    type: string | undefined,
  ) => {
    try {
      const serviceActor = getActor(userAgent)

      if (id === undefined) {
        throw new Error('Order ID is required')
      }
      if (type === undefined) {
        throw new Error('Type is required')
      }

      let result

      if (type === 'buy') {
        result = await serviceActor.cancelBids([id], [])
      } else {
        result = await serviceActor.cancelAsks([id], [])
      }

      return result
    } catch (error) {
      console.error('Error cancel order:', error)
      return []
    }
  }

  /**
   * Manages orders by invoking the `manageOrders` method of the provided service actor.
   *
   * @param userAgent - An instance of HttpAgent used for making authenticated requests.
   * @returns - A promise that resolves to the result of the `manageOrders` operation or an empty array if an error occurs.
   */
  const manageOrders = async (userAgent: HttpAgent) => {
    try {
      const serviceActor = getActor(userAgent)

      const result = await serviceActor.manageOrders([{ all: [] }], [], [])

      return result
    } catch (error) {
      console.error('Error manage orders:', error)
      return []
    }
  }

  return {
    getOpenOrders,
    getOrderSettings,
    placeOrder,
    replaceOrder,
    cancelOrder,
    manageOrders,
  }
}

export default useOrders
