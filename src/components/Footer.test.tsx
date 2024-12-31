import { render, screen } from '@testing-library/react'

import Footer from './footer'

describe('Footer Component', () => {
  it('renders the footer without crashing', () => {
    render(<Footer />)
    const footerElement = screen.getByRole('contentinfo')
    expect(footerElement).toBeInTheDocument()
  })

  it('displays the correct year', () => {
    const currentYear = new Date().getFullYear()
    render(<Footer />)
    const yearText = screen.getByText(new RegExp(currentYear.toString(), 'i'))
    expect(yearText).toBeInTheDocument()
  })

  it('contains the correct link with text and href', () => {
    render(<Footer />)
    const linkElement = screen.getByText(/daily-bid\.com/i)
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('href', '/')
  })
})
