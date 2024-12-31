import { render, screen } from '@testing-library/react'

import Wrapper from './wrapper'

describe('Wrapper Component', () => {
  it('renders without crashing', () => {
    render(<Wrapper>Wrapper Content</Wrapper>)
    const wrapperElement = screen.getByText('Wrapper Content')
    expect(wrapperElement).toBeInTheDocument()
  })

  it('applies default className', () => {
    render(<Wrapper>Wrapper Content</Wrapper>)
    const wrapperElement = screen.getByText('Wrapper Content')
    expect(wrapperElement).toHaveClass('wrapper')
  })

  it('renders children correctly', () => {
    render(
      <Wrapper>
        <div data-testid="child">Child Component</div>
      </Wrapper>,
    )
    const childElement = screen.getByTestId('child')
    expect(childElement).toBeInTheDocument()
    expect(childElement).toHaveTextContent('Child Component')
  })
})
