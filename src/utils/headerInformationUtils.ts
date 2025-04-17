import { DataItem, HeaderInformation } from '../types'
import { fixDecimal } from '../utils/calculationsUtils'

/**
 * Calculates and returns the header information based on the given prices.
 * The header information includes the last auction price, the previous price change in amount and percentage,
 * and the total volume over a specific period.
 *
 * @param prices - An array of DataItem objects containing price and volume information.
 * @param nextSession - The next session to be displayed in the header information.
 * @returns The calculated HeaderInformation object.
 */
export function calculateHeaderInformation(prices: DataItem[]) {
  let headerInformation: HeaderInformation = {
    lastAuction: '',
    previousChange: {
      amount: '',
      percentage: '',
    },
    periodVolume: '',
    priceDigitsLimit: 0,
  }

  function calculatePrices(
    prices: DataItem[],
    headerInformation: HeaderInformation,
  ) {
    if (prices.length) {
      const priceDigitsLimit = prices[0].priceDigitsLimit || 5
      const lastPrice = prices[0].price

      let previousPrice = lastPrice
      if (prices.length >= 2) previousPrice = prices[1].price

      const changeInDollar = lastPrice - previousPrice

      const changeInPercentage =
        ((lastPrice - previousPrice) / previousPrice) * 100

      headerInformation = {
        lastAuction: Number(fixDecimal(lastPrice, priceDigitsLimit)),
        previousChange: {
          amount: Number(fixDecimal(changeInDollar, priceDigitsLimit)),
          percentage: changeInPercentage,
        },
        periodVolume: '',
        priceDigitsLimit,
      }
    }
    return headerInformation
  }

  function calculateVolume(prices: DataItem[]) {
    if (prices.length) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      const filtered = prices.filter((item) => {
        const itemDate = new Date(item.datetime)
        return itemDate >= startDate
      })

      const totalVolume = filtered.reduce((accumulator, currentItem) => {
        return accumulator + currentItem.volumeInQuote
      }, 0)

      return totalVolume
    }

    return 0
  }
  headerInformation = calculatePrices(prices, headerInformation)
  headerInformation.periodVolume = calculateVolume(prices)

  return headerInformation
}
