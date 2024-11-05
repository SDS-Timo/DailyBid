import BigNumber from 'bignumber.js'

import { DataItem, TokenDataItem } from '../types'

/**
 * Normalize the price received from the canister.
 * @param price - The price in the smallest unit received from the canister.
 * @param decimalsPrice - The number of decimal places for the price.
 * @param decimalsQuote - The number of decimal places for the quote currency.
 * @returns The converted price unit of the quote currency.
 */
export function convertPriceFromCanister(
  price: number,
  decimalsPrice: number,
  decimalsQuote: number,
) {
  const decimalFactor = Math.pow(10, decimalsPrice)
  const decimalQuote = Math.pow(10, decimalsQuote)
  const convertedPrice = (price * decimalFactor) / decimalQuote
  return convertedPrice
}

/**
 * Normalize the volume received from the canister.
 * @param volume - The volume in the smallest unit received from the canister.
 * @param decimals - The number of decimal places for the base currency.
 * @param price - The price in the smallest unit of the quote currency.
 * @returns An object containing the volume in quote currency and base currency.
 */
export function convertVolumeFromCanister(
  volume: number,
  decimals: number,
  price: number,
) {
  const decimalFactor = Math.pow(10, -decimals)
  const volumeInBase = new BigNumber(volume).times(decimalFactor)
  const volumeInQuote = volumeInBase.times(price)

  return {
    volumeInQuote: Number(volumeInQuote),
    volumeInBase: Number(volumeInBase),
  }
}

/**
 * Normalize the price in the smallest units of the base and quote currencies.
 * @param price - The price in the quote currency.
 * @param decimalsPrice - The number of decimal places for the price.
 * @param decimalsQuote - The number of decimal places for the quote currency.
 * @returns The price in the smallest unit of the quote currency.
 */
export function convertPriceToCanister(
  price: number,
  decimalsPrice: number,
  decimalsQuote: number,
): number {
  const priceInSmallestUnitBase =
    (price * Math.pow(10, decimalsQuote)) / Math.pow(10, decimalsPrice)
  return priceInSmallestUnitBase
}

/**
 * Normalize the amount in the smallest units of the base currency.
 * @param baseAmount - The amount in the base currency.
 * @param decimalsBase - The number of decimal places for the base currency.
 * @returns The volume in the smallest unit of the base currency.
 */
export function convertVolumetoCanister(
  baseAmount: number,
  decimalsBase: number,
): bigint {
  const smallestUnitBase = Math.pow(10, decimalsBase)
  const volume = baseAmount * smallestUnitBase
  return BigInt(Math.round(volume))
}

/**
 * Calculates the number of decimal places for volume based in step size.
 * @param price - The price of the asset in the base currency.
 * @param stepSize - The step size allowed for volume adjustments.
 * @param decimalsBase - The number of decimals allowed in the base currency.
 * @param decimalsQuote - The number of decimals allowed in the quote currency.
 * @returns The number of decimal places to use for volume calculation.
 */
export function volumeStepSizeDecimals(
  price: number,
  stepSize: number,
  decimalsBase: number,
  decimalsQuote: number,
): number {
  const quoteVolumeStepLog10 = Math.abs(Math.log10(stepSize))
  const quoteVolumeStep = 10 ** quoteVolumeStepLog10
  const log10_down = 2.302585092994045
  let decimalPlaces = decimalsBase

  const priceNat = convertPriceToCanister(price, decimalsBase, decimalsQuote)

  const p = priceNat / quoteVolumeStep
  if (p >= 1) {
    decimalPlaces = decimalsBase
    return decimalPlaces
  }

  const zf = -Math.log(p) / log10_down
  const z = Math.trunc(zf)

  decimalPlaces = decimalsBase - z
  decimalPlaces = decimalPlaces > 100 ? decimalsBase : decimalPlaces
  return decimalPlaces
}

/**
 * Calculates the volume based in step size.
 * @param price - The price of the asset in the base currency.
 * @param amount - The amount of the asset in the base currency.
 * @param decimals - The number of decimals allowed in the base currency.
 * @param stepConstantInQuote - The constant that defines the minimum order size in the quote currency.
 * @returns The calculated volume rounded to the appropriate step size.
 */
export function volumeCalculateStepSize(
  price: number,
  amount: number,
  decimals: number,
  stepConstantInQuote: number,
): { volume: string; volumeFloor: string; stepSize: number } {
  const minimumOrderSizeRaw = stepConstantInQuote / price

  const decimal = -Math.floor(Math.log10(minimumOrderSizeRaw))
  const decimalPlaces = decimal > 0 ? decimal : 0

  const stepSize = parseFloat(
    (1 / Math.pow(10, decimal)).toFixed(decimalPlaces),
  )

  const volume = fixDecimal(stepSize * Math.round(amount / stepSize), decimals)
  const volumeFloor = fixDecimal(
    stepSize * Math.floor(amount / stepSize),
    decimals,
  )
  return { volume, volumeFloor, stepSize }
}

/**
 * Validates whether a given price conforms to a specified digit limit.
 * @param price - The price to be validated.
 * @param digitsLimits - The allowed number of significant digits for the price.
 * @returns A boolean indicating if the price is within the allowed digit limit.
 */
export function priceDigitLimitValidate(price: number, digitsLimits: number) {
  const e = Math.floor(Math.log10(price))
  const n = price * Math.pow(10, digitsLimits - 1 - e)
  const r = Math.round(n)
  return Math.abs(n - r) < 1e-10 || price === 0
}

/**
 * Validates whether a given volume conforms to a specified decimal limit.
 * @param volume - The input volume string to be validated and cleaned.
 * @param decimalPlaces - The number of decimal places allowed.
 * @returns - The cleaned volume string, adhering to the specified decimal place restriction.
 */
export function volumeDecimalsValidate(volume: string, decimalPlaces: number) {
  let cleanedVolume = volume.replace(/[^0-9.]/g, '')

  const dotCount = (cleanedVolume.match(/\./g) || []).length
  if (dotCount > 1) {
    const firstDotIndex = cleanedVolume.indexOf('.')
    cleanedVolume =
      cleanedVolume.slice(0, firstDotIndex + 1) +
      cleanedVolume.slice(firstDotIndex + 1).replace(/\./g, '')
  }

  if (decimalPlaces <= 0) {
    cleanedVolume = cleanedVolume.split('.')[0]
  } else {
    const decimalIndex = cleanedVolume.indexOf('.')

    if (decimalIndex !== -1) {
      const wholePart = cleanedVolume.slice(0, decimalIndex)
      const fractionalPart = cleanedVolume.slice(
        decimalIndex + 1,
        decimalIndex + 1 + decimalPlaces,
      )
      cleanedVolume = `${wholePart}.${fractionalPart}`
    }
  }

  return cleanedVolume
}

/**
 * Retrieves the decimal places from the provided symbol object.
 * @param symbol - The object containing the decimals property. If the property is not found or the input is invalid, a default value is returned.
 * @returns The number of decimal places specified in the symbol object, or a default value of 20 if the property is not found or the input is invalid.
 */
export function getDecimals(symbol: any): number {
  if (symbol && !Array.isArray(symbol) && typeof symbol.decimals === 'number') {
    return symbol.decimals
  }
  return 20
}

/**
 * Add decimal information to the objects.
 * This function calculates and assigns the number of decimal places for price,
 * volume in base currency, and volume in quote currency for each object.
 * @param objects - An array of objects containing price, volumeInBase, and volumeInQuote.
 * @returns The modified array of objects with decimal information added.
 */
export function addDecimal<T extends DataItem | TokenDataItem>(
  objects: T[],
  significantDigits: number,
): T[] {
  function getDecimalPlaces(num: string | number) {
    const numString = convertExponentialToDecimal(num)
    const decimalPart = numString.split('.')[1] || ''
    const firstSignificantDigitIndex = decimalPart.search(/[^0]/)

    if (firstSignificantDigitIndex === -1) {
      return 0
    }

    return firstSignificantDigitIndex + significantDigits
  }

  let maxPriceDecimals = 0
  let maxVolumeInBaseDecimals = 0
  let maxVolumeInQuoteDecimals = 0

  objects.forEach((obj) => {
    const priceDecimals = getDecimalPlaces(obj.price)
    const volumeInBaseDecimals = getDecimalPlaces(obj.volumeInBase)
    const volumeInQuoteDecimals = getDecimalPlaces(obj.volumeInQuote)

    obj.priceDecimals = priceDecimals
    obj.volumeInBaseDecimals = volumeInBaseDecimals
    obj.volumeInQuoteDecimals = volumeInQuoteDecimals

    maxPriceDecimals = Math.max(maxPriceDecimals, priceDecimals)
    maxVolumeInBaseDecimals = Math.max(
      maxVolumeInBaseDecimals,
      volumeInBaseDecimals,
    )
    maxVolumeInQuoteDecimals = Math.max(
      maxVolumeInQuoteDecimals,
      volumeInQuoteDecimals,
    )
  })

  objects.forEach((obj) => {
    obj.priceDecimals = maxPriceDecimals
    obj.volumeDecimals = maxVolumeInBaseDecimals
    obj.volumeInBaseDecimals = maxVolumeInBaseDecimals
    obj.volumeInQuoteDecimals = maxVolumeInQuoteDecimals
  })

  return objects
}

/**
 * Fixes the decimal places of a number and trims trailing zeros
 * @param number - The number to be processed.
 * @param decimalPlaces - The number of decimal places to fix.
 * @returns A string representation of the number with the specified decimal places and without trailing zeros.
 */
export function fixDecimal(number?: number, decimalPlaces?: number): string {
  if (number === undefined || decimalPlaces === undefined) {
    return '0'
  }

  const decimal = decimalPlaces >= 0 ? decimalPlaces : 0
  let fixedNumber = number.toFixed(decimal)

  if (fixedNumber.includes('.')) {
    fixedNumber = fixedNumber.replace(/\.?0+$/, '')
  }

  if (fixedNumber.includes('.') === false && number.toString().includes('.')) {
    fixedNumber += '.0'
  }

  return fixedNumber
}

/**
 * Calculates the number of decimal places needed to ensure the total number
 * of digits (including both integer and decimal parts) matches the digitsLimit.
 * @param number - The number to format as a string.
 * @param digitsLimit - The total number of digits required, including both integer and decimal parts.
 * @returns - The number of decimal places to add to reach the specified digitsLimit.
 */
export function getMinimumFractionDigits(number: string, digitsLimit: number) {
  const [integerPart] = number.split('.')
  const numLength = integerPart.length
  const difference = digitsLimit - numLength

  return difference > 0 ? difference : 0
}

/**
 * Calculates the minimum and maximum values from an array of values.
 * The function adjusts the minimum and maximum based on a dynamic range between 2% and 10%,
 * depending on the difference between the values.
 * For small ranges, it applies a 2% adjustment, increasing smoothly up to 10% for larger ranges.
 * The adjusted values are then rounded to the nearest value based on the magnitude of the maximum value.
 * @param values - An array of values to calculate the scale from.
 * @returns - An object containing the rounded minValue and maxValue.
 */
export function calculateMinMax(values: number[]): {
  minValue: number
  maxValue: number
} {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  // Calculate the percentage adjustment continuously from 2% to 10%
  const adjustmentFactor = Math.min(0.02 + range / 10, 0.1)
  const adjustment = range * adjustmentFactor

  const minRaw = min - adjustment
  const maxRaw = max + adjustment

  const magnitude = Math.pow(10, Math.floor(Math.log10(range)) - 1)

  const minValue = Math.floor(minRaw / magnitude) * magnitude
  const maxValue = Math.ceil(maxRaw / magnitude) * magnitude

  return { minValue, maxValue }
}

/**
 * Converts an exponential number to a decimal representation
 * and removes trailing zeros.
 * @param value - The number in exponential or decimal format to be converted.
 * @returns The number in decimal format without trailing zeros.
 */
export function convertExponentialToDecimal(value: string | number): string {
  const bigNumberValue = new BigNumber(value)
  return bigNumberValue.toFixed().replace(/\.?0+$/, '')
}
