import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { DataItem, PricesState, HeaderInformation, TokenApi } from '../../types'

const initialState: PricesState = {
  isRefreshPrices: false,
  headerInformation: null,
  nextSession: null,
  pricesHistory: [],
  pricesInfo: [],
}

const priceHistorySlice = createSlice({
  name: 'prices',
  initialState,
  reducers: {
    setIsRefreshPrices: (state) => {
      state.isRefreshPrices = !state.isRefreshPrices
    },
    setHeaderInformation: (
      state,
      action: PayloadAction<HeaderInformation | null>,
    ) => {
      state.headerInformation = action.payload
    },
    setPricesHistory: (state, action: PayloadAction<DataItem[] | []>) => {
      state.pricesHistory = action.payload
    },
    setPricesInfo: (state, action: PayloadAction<TokenApi[] | []>) => {
      state.pricesInfo = action.payload
    },
    setNextSession: (state, action: PayloadAction<string | null>) => {
      state.nextSession = action.payload
    },
  },
})

export const {
  setIsRefreshPrices,
  setHeaderInformation,
  setPricesHistory,
  setPricesInfo,
  setNextSession,
} = priceHistorySlice.actions

export default priceHistorySlice.reducer
