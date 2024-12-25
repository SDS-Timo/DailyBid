import { render, screen, fireEvent } from '@testing-library/react'

import NavbarWallet from './'

describe('NavbarWallet Component', () => {
  const mockOnOpen = jest.fn()

  const renderComponent = () => render(<NavbarWallet onOpen={mockOnOpen} />)

  it('renders the wallet button', () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /wallet/i })
    expect(button).toBeInTheDocument()
  })

  it('triggers onOpen when the button is clicked', () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /wallet/i })
    fireEvent.click(button)

    expect(mockOnOpen).toHaveBeenCalledTimes(1)
  })
})
