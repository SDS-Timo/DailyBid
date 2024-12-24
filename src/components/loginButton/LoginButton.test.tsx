import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, fireEvent } from '@testing-library/react'

import LoginButtonComponent from './'

jest.mock('../account', () => {
  const MockedAccountComponent = () => (
    <div data-testid="mocked-account-component" />
  )
  MockedAccountComponent.displayName = 'MockedAccountComponent'
  return {
    __esModule: true,
    default: MockedAccountComponent,
  }
})

describe('Mock AccountComponent', () => {
  it('renders mocked AccountComponent', async () => {
    const { default: MockedAccountComponent } = await import('../account')
    render(<MockedAccountComponent isOpen={false} onClose={jest.fn()} />)
    expect(screen.getByTestId('mocked-account-component')).toBeInTheDocument()
  })
})

describe('LoginButtonComponent', () => {
  const defaultProps = {
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
    symbol: null,
    height: '50px',
  }

  const renderComponent = (props = {}) =>
    render(
      <ChakraProvider>
        <LoginButtonComponent {...defaultProps} {...props} />
      </ChakraProvider>,
    )

  it('LoginButtonComponent is defined', () => {
    expect(LoginButtonComponent).toBeDefined()
  })

  it('renders the button with correct text', () => {
    renderComponent()

    const button = screen.getByRole('button', {
      name: /Login or Create Account/i,
    })
    expect(button).toBeInTheDocument()
  })

  it('disables the button when symbol is null', () => {
    renderComponent()

    const button = screen.getByRole('button', {
      name: /Login or Create Account/i,
    })
    expect(button).toBeDisabled()
  })

  it('enables the button when symbol is provided', () => {
    renderComponent({ symbol: { label: 'BTC', value: 'BTC' } })

    const button = screen.getByRole('button', {
      name: /Login or Create Account/i,
    })
    expect(button).not.toBeDisabled()
  })

  it('calls onOpen when the button is clicked', () => {
    renderComponent({ symbol: { label: 'BTC', value: 'BTC' } })

    const button = screen.getByRole('button', {
      name: /Login or Create Account/i,
    })
    fireEvent.click(button)

    expect(defaultProps.onOpen).toHaveBeenCalled()
  })
})
