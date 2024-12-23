import { render, screen, fireEvent } from '@testing-library/react'

import ActionButton from './index'

const mockProps = {
  action: 'deposit' as const,
  text: 'Deposit',
  bgColor: 'blue.500',
  bgColorHover: 'blue.600',
  fontColor: 'white',
  onClick: jest.fn(),
}

describe('ActionButton Component', () => {
  it('renders the correct icon and text for deposit', () => {
    render(<ActionButton {...mockProps} />)

    const icon = screen.getByTestId('icon')
    expect(icon).toBeInTheDocument()

    expect(screen.getByText('Deposit')).toBeInTheDocument()
  })

  it('renders the correct icon and text for withdraw', () => {
    render(<ActionButton {...mockProps} action="withdraw" text="Withdraw" />)

    const icon = screen.getByTestId('icon')
    expect(icon).toBeInTheDocument()

    expect(screen.getByText('Withdraw')).toBeInTheDocument()
  })

  it('applies the correct background color and hover effect', () => {
    const { getByRole } = render(<ActionButton {...mockProps} />)
    const button = getByRole('button')

    expect(button).toHaveClass('chakra-button')

    fireEvent.mouseOver(button)
  })

  it('calls the onClick function when the button is clicked', () => {
    render(<ActionButton {...mockProps} />)

    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(mockProps.onClick).toHaveBeenCalledTimes(1)
  })
})
