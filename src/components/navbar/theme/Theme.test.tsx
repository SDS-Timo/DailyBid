import { ChakraProvider, ThemeProvider, extendTheme } from '@chakra-ui/react'
import { render, screen, fireEvent } from '@testing-library/react'

import NavbarTheme from './'

describe('NavbarTheme Component', () => {
  const renderComponent = () =>
    render(
      <ChakraProvider>
        <NavbarTheme />
      </ChakraProvider>,
    )

  it('renders the theme toggle button', () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('shows the SunIcon when color mode is light', () => {
    const theme = extendTheme({
      config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
      },
    })

    render(
      <ThemeProvider theme={theme}>
        <ChakraProvider>
          <NavbarTheme />
        </ChakraProvider>
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: /toggle theme/i })).toContainHTML(
      '<svg',
    )
  })

  it('shows the MoonIcon when color mode is dark', () => {
    const theme = extendTheme({
      config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
      },
    })

    render(
      <ThemeProvider theme={theme}>
        <ChakraProvider>
          <NavbarTheme />
        </ChakraProvider>
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: /toggle theme/i })).toContainHTML(
      '<svg',
    )
  })

  it('toggles the color mode when the button is clicked', () => {
    renderComponent()

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(button).toBeInTheDocument()
  })
})
