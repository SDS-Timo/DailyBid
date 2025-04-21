import { render, screen, fireEvent } from '@testing-library/react'

import QrCodeModal from './'
import '@testing-library/jest-dom'

// Mock the QRCode component
jest.mock('react-qr-code', () => {
  return {
    __esModule: true,
    default: function MockQRCode(props: any) {
      return <div data-testid="qr-code" data-value={props.value}></div>
    },
  }
})

describe('QrCodeModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    value: 'https://example.com',
    title: 'Scan QR Code',
    onCopy: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with required props', () => {
    render(<QrCodeModal {...defaultProps} />)

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    expect(screen.getByText(defaultProps.value)).toBeInTheDocument()
    expect(screen.getByTestId('qr-code')).toBeInTheDocument()
    expect(screen.getByTestId('qr-code')).toHaveAttribute(
      'data-value',
      defaultProps.value,
    )
  })

  it('renders subtitle when provided', () => {
    const subtitle = 'Scan this code with your mobile device'
    render(<QrCodeModal {...defaultProps} subtitle={subtitle} />)

    expect(screen.getByText(subtitle)).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    render(<QrCodeModal {...defaultProps} />)

    const subtitleElements = screen.queryAllByText(/scan this code/i)
    expect(subtitleElements).toHaveLength(0)
  })

  it('calls onClose when close button is clicked', () => {
    render(<QrCodeModal {...defaultProps} />)

    const closeButton = screen.getByLabelText('Close')
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onCopy when value text is clicked', () => {
    render(<QrCodeModal {...defaultProps} />)

    const valueText = screen.getByText(defaultProps.value)
    fireEvent.click(valueText)

    expect(defaultProps.onCopy).toHaveBeenCalledTimes(1)
  })

  it('handles modal closed state correctly', () => {
    // When isOpen is false, the modal is not rendered in the document
    // We can check this by querying for the title text
    render(<QrCodeModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
  })
})
