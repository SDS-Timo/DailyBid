import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import i18n from 'i18next'

interface LanguageState {
  language: string | null
}

const getInitialLanguage = (): string | null => {
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) {
    i18n.changeLanguage(savedLanguage)
    return savedLanguage
  }
  return 'en-US'
}

const initialState: LanguageState = {
  language: getInitialLanguage(),
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
      localStorage.setItem('language', action.payload)
      i18n.changeLanguage(action.payload)
    },
  },
})

export const { setLanguage } = languageSlice.actions
export default languageSlice.reducer
