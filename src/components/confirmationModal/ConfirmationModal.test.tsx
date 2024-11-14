import { render, screen, fireEvent } from '@testing-library/react'

import ConfirmationModal from './index'

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Confirmation',
    description: 'Are you sure you want to test this?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  }

  it('renders the modal with title and description', () => {
    render(<ConfirmationModal {...defaultProps} />)

    expect(screen.getByText('Test Confirmation')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to test this?'),
    ).toBeInTheDocument()
  })

  it('renders the confirm and cancel buttons with correct text', () => {
    render(<ConfirmationModal {...defaultProps} />)

    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onClose when the cancel button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />)

    fireEvent.click(screen.getByText('Cancel'))

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when the confirm button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />)

    fireEvent.click(screen.getByText('Confirm'))

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('does not render the modal when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument()
  })
})
