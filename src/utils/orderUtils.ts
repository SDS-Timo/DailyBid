import { Result, TokenDataItem, TokenMetadata } from '../types'

/**
 * Validates if a new order can be placed based on existing orders.
 *
 * @param orders - Array of existing TokenDataItem objects representing current orders.
 * @param base - The base currency symbol for the trade.
 * @param quote - The quote currency symbol for the trade.
 * @param tradeType - The type of trade, either 'buy' or 'sell'.
 * @param price - The price at which the order is to be placed.
 * @param selectedQuote - The metadata for the quote token.
 * @returns A message string if there is a validation issue, or null if the order can be placed.
 */
export const validationPlaceOrder = (
  orders: TokenDataItem[],
  base: string | undefined,
  quote: string | undefined,
  tradeType: string,
  price: number,
  selectedQuote: TokenMetadata,
): string | null => {
  let message: string | null = null

  for (const order of orders) {
    const orderPrice = Number(order.price.toFixed(selectedQuote.decimals))

    if (order.symbol === base) {
      if (order.type === tradeType && orderPrice === price) {
        message = `There is already an open ${tradeType} order for this ${base}/${quote} at the price $${orderPrice}. If you want to adjust the volume then you have to change the existing order.`
        break
      } else if (
        tradeType === 'buy' &&
        order.type === 'sell' &&
        order.price <= price
      ) {
        message = `There is already an open sell order (ask) for ${base}/${quote} at the price of $${orderPrice}. The bid price must be lower than that or you have to cancel the ask.`
        break
      } else if (
        tradeType === 'sell' &&
        order.type === 'buy' &&
        order.price >= price
      ) {
        message = `There is already an open buy order (bid) for ${base}/${quote} at the price of $${orderPrice}. The ask price must be higher than that or you have to cancel the bid.`
        break
      }
    }
  }

  return message
}

/**
 * Gets a user-friendly error message for a place order error.
 *
 * @param error - An object representing the place order error.
 * @returns A string with the corresponding error message.
 */
export const getErrorMessagePlaceOrder = (error: Result): string => {
  const errorMessages: { [key: string]: string } = {
    TooLowOrder: 'Too Low Order',
    ConflictingOrder: 'Conflicting Order',
    UnknownAsset: 'Unknown Asset',
    UnknownOrder: 'Unknown Order',
    NoCredit: 'No Credit',
    UnknownPrincipal: 'Unknown Principal',
    VolumeStepViolated: 'Volume Step Violated',
    SessionNumberMismatch: 'Session Number Mismatch',
    PriceDigitsOverflow: 'Price Digits Overflow',
  }

  for (const key in error) {
    if (error[key] !== undefined && key in errorMessages) {
      return errorMessages[key]
    }
  }
  return 'Something went wrong'
}

/**
 * Gets a user-friendly error message for a cancel order error.
 *
 * @param error - An object representing the cancel order error.
 * @returns A string with the corresponding error message.
 */
export const getErrorMessageCancelOrder = (error: Result): string => {
  const errorMessages: { [key: string]: string } = {
    UnknownOrder: 'Unknown Order',
    UnknownPrincipal: 'Unknown Principal',
    SessionNumberMismatch: 'Session Number Mismatch',
  }

  for (const key in error) {
    if (error[key] !== undefined && key in errorMessages) {
      return errorMessages[key]
    }
  }
  return 'Something went wrong'
}

/**
 * Gets a user-friendly error message for a manage orders error.
 *
 * @param error - An object representing the manage orders error.
 * @returns A string with the corresponding error message.
 */
export const getErrorMessageManageOrders = (error: Result): string => {
  const errorMessages: { [key: string]: string } = {
    placement: 'Error Placement',
    UnknownPrincipal: 'Unknown Principal',
    SessionNumberMismatch: 'Session Number Mismatch',
    cancellation: 'Error Cancellation',
  }

  for (const key in error) {
    if (error[key] !== undefined && key in errorMessages) {
      return errorMessages[key]
    }
  }
  return 'Something went wrong'
}
