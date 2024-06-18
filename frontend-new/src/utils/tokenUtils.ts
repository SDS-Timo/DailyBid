import {
  IcrcTokenMetadataResponse,
  IcrcMetadataResponseEntries,
} from '@dfinity/ledger-icrc'

import { TokenMetadata } from '../types'

export const parseMetadata = (
  metadata: IcrcTokenMetadataResponse,
): TokenMetadata => {
  let symbol = 'unknown'
  let name = 'unknown'
  let decimals = 0
  let logo = ''
  let fee = ''

  metadata.forEach((entry) => {
    switch (entry[0]) {
      case IcrcMetadataResponseEntries.SYMBOL:
        symbol = (entry[1] as { Text: string }).Text
        break
      case IcrcMetadataResponseEntries.NAME:
        name = (entry[1] as { Text: string }).Text
        break
      case IcrcMetadataResponseEntries.DECIMALS:
        decimals = Number((entry[1] as unknown as { Nat: string }).Nat)
        break
      case IcrcMetadataResponseEntries.LOGO:
        logo = (entry[1] as { Text: string }).Text
        break
      case IcrcMetadataResponseEntries.FEE:
        fee = (entry[1] as unknown as { Nat: string }).Nat.toString()
        break
    }
  })

  if (symbol.includes('ck') || name.includes('ck')) {
    symbol = symbol.replace('ck', '')
    name = name.replace('ck', '')
  }

  return { symbol, name, decimals, logo, fee }
}

export const findLogo = async (token: TokenMetadata): Promise<string> => {
  let logo =
    token.logo || `../../../assets/img/coins/${token.symbol.toLowerCase()}.svg`
  const defSymbolLogo = `../../../assets/img/coins/default.svg`

  if (!token.logo) {
    try {
      const response = await fetch(logo)
      const blob = await response.blob()
      if (blob.size === 0 || !blob.type.startsWith('image')) {
        throw new Error('Image not found or not an image')
      }
    } catch (error) {
      logo = defSymbolLogo
    }
  }

  return logo
}
