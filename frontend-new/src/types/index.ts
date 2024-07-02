import { Option as OptionBymax } from 'bymax-react-select'

export interface Language {
  [key: string]: string
}
export interface Order {
  id: string
  side: 'buy' | 'sell'
  amount: number
  price: number
}
export interface Trade {
  id: string
  price: number
  amount: number
  time: string
  type: 'buy' | 'sell'
}
export interface TokenMetadata {
  symbol: string
  name: string
  decimals: number
  logo: string
  fee: string
  principal?: string
}
export interface Option extends OptionBymax {
  decimals?: number
  principal?: string
  lastAuction?: number
  previousChange?: number
  periodVolume?: number
}
export interface HeaderInformation {
  lastAuction: number | string
  previousChange: {
    amount: number | string
    percentage: number | string
  }
  periodVolume: number | string
}
export interface TokensState {
  selectedSymbol: Option | Option[] | null
  selectedQuote: TokenMetadata
  headerInformation: HeaderInformation | null
}
export interface DataItem {
  label: string
  price: number
  volume: number
  volumeInBase: number
  volumeInQuote: number
  priceDecimals?: number
  volumeDecimals?: number
  volumeInBaseDecimals?: number
  volumeInQuoteDecimals?: number
}
