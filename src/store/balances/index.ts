import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, BalancesState } from '../../types'

const initialState: BalancesState = {
  isRefreshBalances: false,
  isWithdrawStarted: false,
  balances: [],
}

const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    setIsRefreshBalances: (state) => {
      state.isRefreshBalances = !state.isRefreshBalances
    },
    setIsWithdrawStarted: (state) => {
      state.isWithdrawStarted = !state.isWithdrawStarted
    },
    setBalances: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.balances = action.payload
    },
  },
})

export const { setIsRefreshBalances, setIsWithdrawStarted, setBalances } =
  balancesSlice.actions

export default balancesSlice.reducer
