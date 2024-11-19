import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, OpenOrdersState } from '../../types'

const initialState: OpenOrdersState = {
  isRefreshUserData: false,
  orderSettings: {
    orderQuoteVolumeMinimum: 0,
    orderQuoteVolumeMinimumNat: '0',
    orderPriceDigitsLimit: 0,
    orderPriceDigitsLimitNat: '0',
    orderQuoteVolumeStep: 0,
    orderQuoteVolumeStepNat: '0',
  },
  orderDetails: {
    id: 0n,
    base: '',
    volumeInBase: 0n,
    volumeInQuote: 0n,
    price: 0,
    type: '',
  },
  openOrders: [],
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setIsRefreshUserData: (state) => {
      state.isRefreshUserData = !state.isRefreshUserData
    },
    setOrderSettings: (state, action) => {
      state.orderSettings = action.payload
    },
    setOrderDetails: (state, action) => {
      state.orderDetails = action.payload
    },
    setOpenOrders: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.openOrders = action.payload
    },
  },
})

export const {
  setIsRefreshUserData,
  setOrderSettings,
  setOrderDetails,
  setOpenOrders,
} = ordersSlice.actions

export default ordersSlice.reducer
