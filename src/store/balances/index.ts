import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, BalancesState } from '../../types'

const initialState: BalancesState = {
  isRefreshBalances: false,
  balances: [],
}

const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    setIsRefreshBalances: (state) => {
      state.isRefreshBalances = !state.isRefreshBalances
    },
    setBalances: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.balances = action.payload
    },
  },
})

export const { setIsRefreshBalances, setBalances } = balancesSlice.actions

export default balancesSlice.reducer
