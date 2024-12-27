import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, fireEvent } from '@testing-library/react'

import AutoClaimSettings from './autoClaimSettings'

interface Option {
  id: string
  value: string
  label: string
}

interface SelectProps {
  options: Option[]
  value: Option | null
  onChange: (option: Option | null) => void
  placeholder: string
}

jest.mock('bymax-react-select', () => ({
  Select: ({ options, value, onChange, placeholder }: SelectProps) => (
    <select
      data-testid="select"
      value={value ? value.value : ''}
      onChange={(e) => {
        const selectedOption = options.find(
          (option) => option.value === e.target.value,
        )
        onChange(selectedOption || null)
      }}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.id} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}))

const renderWithChakra = (ui: React.ReactElement): ReturnType<typeof render> =>
  render(<ChakraProvider>{ui}</ChakraProvider>)

describe('AutoClaimSettings Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the Select component with correct placeholder', () => {
    renderWithChakra(<AutoClaimSettings />)

    const selectElement = screen.getByTestId('select')
    expect(selectElement).toBeInTheDocument()
    expect(selectElement).toHaveDisplayValue('Select the interval')
  })

  it('loads the initial value from localStorage if present', () => {
    localStorage.setItem('selectedTimeAutoClaimInterval', '1')
    renderWithChakra(<AutoClaimSettings />)

    const selectElement = screen.getByTestId('select')
    expect(selectElement).toHaveDisplayValue('1 min')
  })

  it('sets and updates the selected value in localStorage when an option is selected', () => {
    renderWithChakra(<AutoClaimSettings />)

    const selectElement = screen.getByTestId('select')
    fireEvent.change(selectElement, { target: { value: '2' } })

    expect(localStorage.getItem('selectedTimeAutoClaimInterval')).toBe('2')
    expect(selectElement).toHaveDisplayValue('2 min')
  })

  it('handles no initial value gracefully when localStorage is empty', () => {
    renderWithChakra(<AutoClaimSettings />)

    const selectElement = screen.getByTestId('select')
    expect(selectElement).toBeInTheDocument()
    expect(selectElement).toHaveDisplayValue('Select the interval')
  })
})
