import { render, screen, fireEvent } from '@testing-library/react'

import NavbarHelp from './'

const mockWindowOpen = jest.fn()
window.open = mockWindowOpen

describe('NavbarHelp', () => {
  it('renders the help icon button', () => {
    render(<NavbarHelp />)

    const button = screen.getByRole('button', { name: /Wallet/i })
    expect(button).toBeInTheDocument()
  })

  it('opens the help URL in a new tab when clicked', () => {
    process.env.ENV_HELP_DOC_URL = 'https://help.example.com'

    render(<NavbarHelp />)

    const button = screen.getByRole('button', { name: /Wallet/i })
    fireEvent.click(button)

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://help.example.com',
      '_blank',
    )
  })
})
