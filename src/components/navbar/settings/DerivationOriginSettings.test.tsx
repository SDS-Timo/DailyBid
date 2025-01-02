import { ChakraProvider, useToast } from '@chakra-ui/react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import DerivationOriginSettings from './derivationOriginSettings'

const mockStore = configureStore()
const initialState = {
  auth: {
    isAuthenticated: false,
  },
}
const store = mockStore(initialState)

jest.mock('../../../utils/canisterUtils', () => ({
  getInternetIdentityDerivationOrigin: jest.fn(
    () => 'https://5kqtj-oaaaa-aaaao-a3q5a-cai.icp0.io',
  ),
  validateCanisterIdOrUrl: jest.fn(
    (input) =>
      input === '5kqtj-oaaaa-aaaao-a3q5a-cai' ||
      input === 'https://5kqtj-oaaaa-aaaao-a3q5a-cai.icp0.io',
  ),
}))

beforeAll(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'auctionDerivationOrigin') {
      return 'https://5kqtj-oaaaa-aaaao-a3q5a-cai.icp0.io'
    }
    return null
  })
})

jest.mock('@chakra-ui/react', () => {
  const original = jest.requireActual('@chakra-ui/react')
  return {
    ...original,
    useToast: jest.fn().mockImplementation(() => jest.fn()),
  }
})

describe('DerivationOriginSettings Component', () => {
  const renderComponent = async () => {
    process.env.ENV_AUTH_DERIVATION_ORIGIN = '5kqtj-oaaaa-aaaao-a3q5a-cai'

    render(
      <Provider store={store}>
        <ChakraProvider>
          <DerivationOriginSettings />
        </ChakraProvider>
      </Provider>,
    )
  }

  it('renders the component with default values from localStorage', async () => {
    await renderComponent()

    await waitFor(() => {
      const inputElement = screen.getByLabelText('Canister ID or full URL')
      expect(inputElement).toBeInTheDocument()
      expect(inputElement).toHaveValue('5kqtj-oaaaa-aaaao-a3q5a-cai')

      const saveButton = screen.getByText('Save')
      expect(saveButton).toBeInTheDocument()
    })
  })

  it('shows an error for invalid Canister ID or URL', async () => {
    await renderComponent()

    const inputElement = screen.getByLabelText('Canister ID or full URL')
    fireEvent.change(inputElement, { target: { value: 'invalid-id' } })

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      const errorMessage = screen.getByText('Invalid Canister ID')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  it('updates the input field value when user edits it', async () => {
    await renderComponent()

    const inputElement = screen.getByLabelText('Canister ID or full URL')
    fireEvent.change(inputElement, {
      target: { value: '5kqtj-oaaaa-aaaao-a3q5a-cai' },
    })

    await waitFor(() => {
      expect(inputElement).toHaveValue('5kqtj-oaaaa-aaaao-a3q5a-cai')
    })
  })

  it('uses the Default button to set the default Canister ID', async () => {
    await renderComponent()

    const defaultButton = screen.getByText('Default')
    fireEvent.click(defaultButton)

    await waitFor(() => {
      const inputElement = screen.getByLabelText('Canister ID or full URL')
      expect(inputElement).toHaveValue('5kqtj-oaaaa-aaaao-a3q5a-cai')
    })
  })

  it('disables the Save button when user is authenticated', async () => {
    ;(store.getState() as typeof initialState).auth.isAuthenticated = true

    await renderComponent()

    await waitFor(() => {
      const saveButton = screen.queryByText('Save')
      expect(saveButton).not.toBeInTheDocument()
    })
  })

  it('shows a success toast after saving a valid Canister ID', async () => {
    ;(store.getState() as typeof initialState).auth.isAuthenticated = false

    const mockToast = jest.fn()
    ;(useToast as jest.Mock).mockReturnValue(mockToast)

    await renderComponent()

    const inputElement = screen.getByLabelText('Canister ID or full URL')
    fireEvent.change(inputElement, {
      target: { value: '5kqtj-oaaaa-aaaao-a3q5a-cai' },
    })

    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Internet Identity Derivation Origin',
          description: 'Saved successfully',
          status: 'success',
        }),
      )
    })
  })
})
