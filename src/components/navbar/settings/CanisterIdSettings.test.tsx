import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import CanisterIdSettings from './canisterIdSettings'

const mockStore = configureStore()
const initialState = {
  auth: {
    userAgent: {},
  },
  orders: {},
  prices: {},
  tokens: {},
}
const store = mockStore(initialState)

jest.mock('../../../hooks/useTokens', () => () => ({
  getTokens: jest.fn(),
}))

jest.mock('../../../utils/canisterUtils', () => ({
  getAuctionCanisterId: jest.fn(() => 'mock-canister-id'),
}))

jest.mock('@dfinity/agent', () => ({
  HttpAgent: class {
    constructor() {}
    createSync = jest.fn()
  },
  AnonymousIdentity: class {},
}))

jest.mock('@dfinity/auth-client', () => ({
  AuthClient: {
    create: jest.fn().mockResolvedValue({
      login: jest.fn(),
      isAuthenticated: jest.fn().mockResolvedValue(true),
      getIdentity: jest.fn(),
    }),
  },
}))

jest.mock('@dfinity/identity', () => ({
  Ed25519KeyIdentity: class {},
}))

jest.mock('@dfinity/identity-secp256k1', () => ({
  Secp256k1KeyIdentity: class {},
}))

describe('CanisterIdSettings Component', () => {
  const renderComponent = () => {
    render(
      <Provider store={store}>
        <ChakraProvider>
          <CanisterIdSettings />
        </ChakraProvider>
      </Provider>,
    )
  }

  it('renders the component with default values', () => {
    renderComponent()

    const inputElement = screen.getByPlaceholderText(' ')
    expect(inputElement).toBeInTheDocument()
    expect(inputElement).toHaveValue('mock-canister-id')

    const saveButton = screen.getByText('Save')
    expect(saveButton).toBeInTheDocument()
  })

  it('shows an error for invalid Canister ID', async () => {
    renderComponent()

    const inputElement = screen.getByPlaceholderText(' ')
    fireEvent.change(inputElement, { target: { value: 'invalid-id' } })

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      const errorMessage = screen.getByText('Invalid Canister ID')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  it('updates the input field value', () => {
    renderComponent()

    const inputElement = screen.getByPlaceholderText(' ')
    fireEvent.change(inputElement, { target: { value: 'aaaaa-aa' } })

    expect(inputElement).toHaveValue('aaaaa-aa')
  })
})
