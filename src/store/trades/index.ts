import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, TradesState } from '../../types'

const initialState: TradesState = {
  trades: [],
}

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setTrades: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.trades = action.payload
    },
  },
})

export const { setTrades } = tradesSlice.actions

export default tradesSlice.reducer
