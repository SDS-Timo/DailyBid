import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, BalancesState } from '../../types'

const initialState: BalancesState = {
  balances: [],
  userPoints: null,
}

const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    setBalances: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.balances = action.payload
    },
    setUserPoints: (state, action: PayloadAction<number | null>) => {
      state.userPoints = action.payload
    },
  },
})

export const { setBalances, setUserPoints } = balancesSlice.actions

export default balancesSlice.reducer
