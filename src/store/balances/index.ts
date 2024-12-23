import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, BalancesState } from '../../types'

const initialState: BalancesState = {
  balances: [],
}

const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    setBalances: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.balances = action.payload
    },
  },
})

export const { setBalances } = balancesSlice.actions

export default balancesSlice.reducer
