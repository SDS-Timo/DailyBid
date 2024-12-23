import { render, screen, fireEvent } from '@testing-library/react'

import CustomSlider from './'

describe('CustomSlider Component', () => {
  const mockOnChangeValue = jest.fn()

  const defaultProps = {
    values: [-5, 0, 5],
    currentValue: 0,
    onChangeValue: mockOnChangeValue,
    step: 1,
    unit: '%',
    tooltipBgColor: 'gray.500',
    tooltipTextColor: 'white',
    fontSize: 'sm',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the slider with correct values', () => {
    render(<CustomSlider {...defaultProps} />)

    expect(screen.getByRole('slider')).toBeInTheDocument()

    defaultProps.values.forEach((value) => {
      expect(screen.getByText(`${value}%`)).toBeInTheDocument()
    })
  })

  it('calls onChangeValue when the slider value changes', () => {
    render(<CustomSlider {...defaultProps} />)

    const sliderThumb = screen.getByRole('slider')

    fireEvent.keyDown(sliderThumb, { key: 'ArrowRight' })
    fireEvent.keyDown(sliderThumb, { key: 'ArrowRight' })

    expect(mockOnChangeValue).toHaveBeenCalledTimes(2)
  })

  it('displays the correct tooltip value', () => {
    render(<CustomSlider {...defaultProps} />)

    const sliderThumb = screen.getByRole('slider')

    fireEvent.mouseEnter(sliderThumb)

    const tooltip = screen.getByTestId('slider-tooltip')
    expect(tooltip).toHaveTextContent('0%')
  })

  it('adjusts the slider value correctly', () => {
    const { rerender } = render(
      <CustomSlider {...defaultProps} currentValue={-5} />,
    )

    expect(screen.getByText('-5%')).toBeInTheDocument()

    rerender(<CustomSlider {...defaultProps} currentValue={5} />)

    expect(screen.getByText('5%')).toBeInTheDocument()
  })

  it('renders without crashing with default props', () => {
    render(<CustomSlider {...defaultProps} />)

    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('does not allow interaction when isDisabled is true', () => {
    render(<CustomSlider {...defaultProps} isDisabled={true} />)

    const sliderThumb = screen.getByRole('slider')

    expect(sliderThumb).toHaveAttribute('aria-disabled', 'true')

    fireEvent.keyDown(sliderThumb, { key: 'ArrowRight' })

    expect(mockOnChangeValue).not.toHaveBeenCalled()
  })
})
