import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import LoginDurationSettings from './loginDurationSettings'

const mockStore = configureStore()
const initialState = {
  auth: {
    isAuthenticated: false,
  },
}

beforeAll(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'selectedTimeLoginDurationInterval') {
      return '24'
    }
    return null
  })

  Storage.prototype.setItem = jest.fn()
})

describe('LoginDurationSettings Component', () => {
  const renderComponent = (storeState = initialState) => {
    const customStore = mockStore(storeState)

    localStorage.setItem('selectedTimeLoginDurationInterval', '24')

    render(
      <Provider store={customStore}>
        <ChakraProvider>
          <LoginDurationSettings />
        </ChakraProvider>
      </Provider>,
    )
  }

  it('renders the component with default value from localStorage', () => {
    renderComponent()

    const selectElement = screen.getByTestId('select')
    expect(selectElement).toBeInTheDocument()
    expect(selectElement).toHaveValue('24')
  })

  it('updates the selected value on change', () => {
    renderComponent()

    const selectElement = screen.getByTestId('select')
    fireEvent.change(selectElement, { target: { value: '12' } })

    expect(selectElement).toHaveValue('12')
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'selectedTimeLoginDurationInterval',
      '12',
    )
  })

  it('disables the dropdown when user is authenticated', () => {
    const authenticatedState = {
      auth: {
        isAuthenticated: true,
      },
    }
    renderComponent(authenticatedState)

    const selectElement = screen.getByTestId('select')
    expect(selectElement).toBeDisabled()
  })

  it('displays the correct placeholder when no value is selected', () => {
    ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

    renderComponent()

    const selectElement = screen.getByTestId('select')
    expect(selectElement).toHaveValue('')
    expect(screen.getByText('Select the login duration')).toBeInTheDocument()
  })
})
