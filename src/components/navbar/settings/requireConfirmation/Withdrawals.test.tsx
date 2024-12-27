import { render, screen, fireEvent } from '@testing-library/react'

import Withdrawals from './withdrawals'

describe('Withdrawals Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders correctly with initial state from localStorage', () => {
    localStorage.setItem('withdrawalsDoubleConfirmation', 'true')
    render(<Withdrawals />)

    const switchElement = screen.getByRole('checkbox')
    expect(switchElement).toBeChecked()
  })

  it('renders with default state when localStorage is empty', () => {
    render(<Withdrawals />)

    const switchElement = screen.getByRole('checkbox')
    expect(switchElement).not.toBeChecked()
  })

  it('toggles the switch state and updates localStorage', () => {
    render(<Withdrawals />)

    const switchElement = screen.getByRole('checkbox')
    expect(switchElement).not.toBeChecked()

    fireEvent.click(switchElement)

    expect(switchElement).toBeChecked()
    expect(localStorage.getItem('withdrawalsDoubleConfirmation')).toBe('true')

    fireEvent.click(switchElement)

    expect(switchElement).not.toBeChecked()
    expect(localStorage.getItem('withdrawalsDoubleConfirmation')).toBe('false')
  })

  it('applies correct styles to the switch based on state', () => {
    render(<Withdrawals />)

    const switchElement = screen.getByRole('checkbox')
    const track = switchElement.nextElementSibling

    expect(track).toHaveStyle('background-color: grey.500')

    fireEvent.click(switchElement)
    expect(track).toHaveStyle('background-color: blue.500')
  })
})
