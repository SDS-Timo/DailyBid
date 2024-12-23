import { render, screen } from '@testing-library/react'

import ActionIcon from './'

describe('ActionIcon Component', () => {
  const getIconComponent = () => screen.getByTestId('icon')

  it('should render the deposit icon', () => {
    render(<ActionIcon action="deposit" />)
    const icon = getIconComponent()
    expect(icon).toHaveClass('chakra-icon')
    expect(icon.querySelector('polyline')).not.toBeNull()
  })

  it('should render the withdrawal icon', () => {
    render(<ActionIcon action="withdrawal" />)
    const icon = getIconComponent()
    expect(icon).toHaveClass('chakra-icon')
    expect(icon.querySelector('polyline')).not.toBeNull()
  })

  it('should render the withdrawalRollback icon', () => {
    render(<ActionIcon action="withdrawalRollback" />)
    const icon = getIconComponent()
    expect(icon).toHaveClass('chakra-icon')
    expect(icon.querySelector('line')).not.toBeNull()
  })
})
