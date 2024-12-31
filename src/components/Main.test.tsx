import { render, screen } from '@testing-library/react'

import Main from './main'

describe('Main Component', () => {
  it('renders without crashing', () => {
    render(<Main>Main Content</Main>)
    const mainElement = screen.getByText('Main Content')
    expect(mainElement).toBeInTheDocument()
  })

  it('applies default className', () => {
    render(<Main>Main Content</Main>)
    const mainElement = screen.getByText('Main Content')
    expect(mainElement).toHaveClass('main')
  })

  it('applies additional className when provided', () => {
    render(<Main className="extra-class">Main Content</Main>)
    const mainElement = screen.getByText('Main Content')
    expect(mainElement).toHaveClass('main')
    expect(mainElement).toHaveClass('extra-class')
  })

  it('renders children correctly', () => {
    render(
      <Main>
        <div data-testid="child">Child Component</div>
      </Main>,
    )
    const childElement = screen.getByTestId('child')
    expect(childElement).toBeInTheDocument()
    expect(childElement).toHaveTextContent('Child Component')
  })
})
