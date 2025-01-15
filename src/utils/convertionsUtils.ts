import { Buffer } from 'buffer'

import { encodeIcrcAccount, decodeIcrcAccount } from '@dfinity/ledger-icrc'
import { Principal } from '@dfinity/principal'
import bigInt from 'big-integer'

import { getAuctionCanisterId } from './canisterUtils'

/**
 * Converts a hexadecimal string to a big integer.
 * @param hexFormat - The hexadecimal string in the format '0x...'.
 * @returns A big integer representation of the hexadecimal number or undefined if invalid.
 */
const hexToNumber = (hexFormat: string) => {
  if (!hexFormat.startsWith('0x')) return undefined
  const hex = hexFormat.slice(2)
  if (!/^[a-fA-F0-9]+$/.test(hex)) return undefined

  let number = bigInt(0)
  for (let index = 0; index < hex.length; index++) {
    const digit = hex[hex.length - index - 1]
    const value = bigInt(parseInt(digit, 16))
    number = number.add(value.multiply(bigInt(16).pow(index)))
  }

  return number
}

/**
 * Converts a hexadecimal string to a Uint8Array.
 * @param hex - The hexadecimal string in the format '0x...'.
 * @returns A Uint8Array of 32 bytes representing the hexadecimal number.
 */
export const hexToUint8Array = (hex: string): Uint8Array => {
  const bigNumber = hexToNumber(hex)
  if (!bigNumber) return new Uint8Array(32)

  const result = new Uint8Array(32)
  const n256 = bigInt(256)
  let tempNumber = bigNumber
  let i = 0

  while (tempNumber.greater(0)) {
    result[31 - i] = tempNumber.mod(n256).toJSNumber()
    tempNumber = tempNumber.divide(n256)
    i++
  }

  return result
}

/**
 * Converts a Principal string into an account object with subaccount information.
 * @param principal - The string representation of the Principal.
 * @returns An object containing the subaccount as a hexadecimal string and the subAccountId in `0x` prefixed format.
 */
export function getSubAccountFromPrincipal(principal: string) {
  const principalBytes = Principal.fromText(principal).toUint8Array()
  const lengthHex = principalBytes.length.toString(16).padStart(2, '0')
  const hex = Buffer.from(principalBytes).toString('hex')

  return {
    subaccount: lengthHex + hex,
    subAccountId: `0x${lengthHex + hex}`,
  }
}

/**
 * Converts a Principal string into a deposit account information.
 * @param principal - The string representation of the Principal.
 * @returns An object containing the deposit account string.
 */
export function getUserDepositAddress(principal: string) {
  const hexSubAccountId = getSubAccountFromPrincipal(principal).subAccountId

  const subAccountUint8Array = new Uint8Array(hexToUint8Array(hexSubAccountId))

  const auctionCanisterId = getAuctionCanisterId()

  const depositAccount = encodeIcrcAccount({
    owner: Principal.fromText(auctionCanisterId),
    subaccount: subAccountUint8Array,
  })

  return depositAccount
}

export const decodeIcrcAccountText = (account: string) => {
  try {
    return decodeIcrcAccount(account)
  } catch {
    return undefined
  }
}

/**
 * Truncates a number to the specified number of decimal places without rounding.
 *
 * @param num - The number to be truncated.
 * @param decimalPlaces - The number of decimal places to keep.
 * @returns The truncated number as a string with the specified number of decimal places.
 */
export function toFixedWithoutRounding(num: number, decimalPlaces: number) {
  const numStr = num.toString()
  const decimalIndex = numStr.indexOf('.')

  if (decimalIndex === -1) {
    return numStr + '.' + '0'.repeat(decimalPlaces)
  }

  const desiredLength = decimalIndex + decimalPlaces + 1

  if (numStr.length <= desiredLength) {
    return numStr
  }

  return numStr.slice(0, desiredLength)
}
