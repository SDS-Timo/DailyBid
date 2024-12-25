import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import NavbarInfo from './'

jest.mock('../../../hooks/useOrders', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getOrderSettings: jest.fn().mockResolvedValue({
      orderQuoteVolumeMinimum: 0.1,
      orderQuoteVolumeStep: 0.01,
      orderPriceDigitsLimit: 8,
    }),
  })),
}))

jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react')
  return {
    ...originalModule,
    useClipboard: jest.fn(() => ({
      onCopy: jest.fn(),
    })),
  }
})

jest.mock('../../../utils/canisterUtils', () => ({
  getAuctionCanisterId: jest.fn(() => 'test-auction-principal'),
}))

describe('NavbarInfo Component', () => {
  const mockStore = configureStore([])
  const initialState = {
    auth: { userAgent: 'test-user-agent' },
    tokens: {
      selectedQuote: { principal: 'test-quote-principal', base: 'TEST' },
    },
    orders: {
      orderSettings: {
        orderQuoteVolumeMinimum: 0.1,
        orderQuoteVolumeStep: 0.01,
        orderPriceDigitsLimit: 8,
      },
    },
  }
  const store = mockStore(initialState)

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <ChakraProvider>
          <NavbarInfo />
        </ChakraProvider>
      </Provider>,
    )

  it('renders the NavbarInfo component', () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /Info/i })
    expect(button).toBeInTheDocument()
  })

  it('displays the backend principal and copies it to clipboard', async () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /Info/i })
    fireEvent.click(button)

    const backendPrincipal = await screen.findByText('test-auction-principal')
    expect(backendPrincipal).toBeInTheDocument()

    fireEvent.click(backendPrincipal)
    expect(screen.getByText('Copied')).toBeInTheDocument()
  })

  it('displays the quote token principal and copies it to clipboard', async () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /Info/i })
    fireEvent.click(button)

    const quotePrincipal = await screen.findByText('test-quote-principal')
    expect(quotePrincipal).toBeInTheDocument()

    fireEvent.click(quotePrincipal)
    expect(screen.getByText('Copied')).toBeInTheDocument()
  })

  it('displays order settings', async () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /Info/i })
    fireEvent.click(button)

    expect(await screen.findByText(/0.1 TEST minimum/i)).toBeInTheDocument()
    expect(await screen.findByText(/0.01 TEST step size/i)).toBeInTheDocument()
    expect(await screen.findByText(/8 significant digits/i)).toBeInTheDocument()
  })
})
