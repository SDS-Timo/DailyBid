import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, BalancesState, CkBtcUtxo } from '../../types'

const initialState: BalancesState = {
  isRefreshBalances: false,
  balances: [],
  ckBtcUtxo: [],
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
    setCkBtcUtxo: (state, action: PayloadAction<CkBtcUtxo[] | []>) => {
      state.ckBtcUtxo = action.payload
    },
  },
})

export const { setIsRefreshBalances, setBalances, setCkBtcUtxo } =
  balancesSlice.actions

export default balancesSlice.reducer
