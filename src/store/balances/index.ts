import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  TokenDataItem,
  BalancesState,
  CkBtcUtxo,
  NewBtcUtxo,
} from '../../types'

const initialState: BalancesState = {
  isRefreshBalances: false,
  balances: [],
  ckBtcUtxo: [],
  newBtcUtxo: [],
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
    setNewBtcUtxo: (state, action: PayloadAction<NewBtcUtxo[] | []>) => {
      state.newBtcUtxo = action.payload
    },
  },
})

export const {
  setIsRefreshBalances,
  setBalances,
  setCkBtcUtxo,
  setNewBtcUtxo,
} = balancesSlice.actions

export default balancesSlice.reducer
