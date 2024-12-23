import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isResizeUserData: false,
}

const uiSettingsSlice = createSlice({
  name: 'uiSettings',
  initialState,
  reducers: {
    setIsResizeUserData: (state) => {
      state.isResizeUserData = !state.isResizeUserData
    },
  },
})

export const { setIsResizeUserData } = uiSettingsSlice.actions

export default uiSettingsSlice.reducer
