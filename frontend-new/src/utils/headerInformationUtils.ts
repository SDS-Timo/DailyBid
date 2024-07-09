import { DataItem, HeaderInformation } from '../types'

export function calculateHeaderInformation(prices: DataItem[]) {
  let headerInformation: HeaderInformation = {
    lastAuction: '',
    previousChange: {
      amount: '',
      percentage: '',
    },
    periodVolume: '',
  }

  function calculatePrices(
    prices: DataItem[],
    headerInformation: HeaderInformation,
  ) {
    if (prices.length) {
      const lastPrice = prices[prices.length - 1].price
      const previousPrice = prices[prices.length - 2].price

      const changeInDollar = lastPrice - previousPrice

      const changeInPercentage =
        ((lastPrice - previousPrice) / previousPrice) * 100

      headerInformation = {
        lastAuction: lastPrice,
        previousChange: {
          amount: changeInDollar,
          percentage: changeInPercentage,
        },
        periodVolume: '',
      }
    }
    return headerInformation
  }

  function calculateVolume(prices: DataItem[]) {
    if (prices.length) {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 6)

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