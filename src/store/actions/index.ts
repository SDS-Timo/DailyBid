import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, ActionsState } from '../../types'

const initialState: ActionsState = {
  actions: [],
}

const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    setActions: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.actions = action.payload
    },
  },
})

export const { setActions } = actionsSlice.actions

export default actionsSlice.reducer
