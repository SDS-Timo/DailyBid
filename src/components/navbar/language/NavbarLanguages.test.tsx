import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { LANGUAGES_OPTIONS } from '../../../constants/languages'
import { setLanguage } from '../../../store/language'

import NavbarLanguages from './index'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const mockStore = configureStore([])
const initialState = {
  language: { language: 'en' },
}
const store = mockStore(initialState)

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ChakraProvider>{ui}</ChakraProvider>
    </Provider>,
  )
}

describe('NavbarLanguages', () => {
  it('renders with the selected language icon', () => {
    renderWithProviders(<NavbarLanguages />)
    const selectedLanguageKey = initialState.language.language.substring(0, 2)
    const selectedLanguage =
      LANGUAGES_OPTIONS[selectedLanguageKey as keyof typeof LANGUAGES_OPTIONS]
    expect(screen.getAllByAltText(selectedLanguage.name)[0]).toBeInTheDocument()
  })

  it('opens the menu when the button is clicked', async () => {
    renderWithProviders(<NavbarLanguages />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
  })

  it('displays all language options in the menu', async () => {
    renderWithProviders(<NavbarLanguages />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    await waitFor(() => {
      Object.keys(LANGUAGES_OPTIONS).forEach((key) => {
        const language =
          LANGUAGES_OPTIONS[key as keyof typeof LANGUAGES_OPTIONS]
        expect(screen.getByText(language.name)).toBeInTheDocument()
      })
    })
  })

  it('changes the language when a menu item is clicked', async () => {
    renderWithProviders(<NavbarLanguages />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    const italianLanguage = LANGUAGES_OPTIONS.it
    const italianMenuItem = await screen.findByText(italianLanguage.name)
    fireEvent.click(italianMenuItem)
    const actions = store.getActions()
    expect(actions).toContainEqual(setLanguage(italianLanguage.lng))
  })
})
