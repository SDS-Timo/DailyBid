import { render, screen, fireEvent } from '@testing-library/react'

import Disclaimer from './'

describe('DisclaimerModal Component', () => {
  const onCloseMock = jest.fn()

  const renderComponent = (isOpen: boolean = true) => {
    render(<Disclaimer isOpen={isOpen} onClose={onCloseMock} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the modal when isOpen is true', () => {
    renderComponent()
    expect(screen.getByText(/welcome to dailybid/i)).toBeInTheDocument()
    expect(
      screen.getByText(/please note: this is an early access alpha version./i),
    ).toBeInTheDocument()
  })

  it('should not render the modal when isOpen is false', () => {
    renderComponent(false)
    expect(screen.queryByText(/welcome to dailybid/i)).not.toBeInTheDocument()
  })

  it('should have the checkbox unchecked by default', () => {
    renderComponent()
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should enable the button when the checkbox is checked', () => {
    renderComponent()
    const checkbox = screen.getByRole('checkbox')
    const button = screen.getByRole('button', { name: /accept & continue/i })

    expect(button).toBeDisabled()

    fireEvent.click(checkbox)
    expect(button).not.toBeDisabled()
  })

  it('should call onClose when the button is clicked and checkbox is checked', () => {
    renderComponent()
    const checkbox = screen.getByRole('checkbox')
    const button = screen.getByRole('button', { name: /accept & continue/i })

    fireEvent.click(checkbox)
    fireEvent.click(button)

    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when the button is clicked and checkbox is unchecked', () => {
    renderComponent()
    const button = screen.getByRole('button', { name: /accept & continue/i })

    fireEvent.click(button)

    expect(onCloseMock).not.toHaveBeenCalled()
  })

  it('should not close the modal when clicking outside the modal', () => {
    renderComponent()
    const overlay = screen.getByTestId('chakra-modal__overlay')

    fireEvent.click(overlay)

    expect(screen.getByText(/welcome to dailybid/i)).toBeInTheDocument()
    expect(onCloseMock).not.toHaveBeenCalled()
  })
})
