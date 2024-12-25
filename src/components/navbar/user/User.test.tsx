import { ChakraProvider } from '@chakra-ui/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import NavbarUser from './'

describe('NavbarUser Component', () => {
  const mockStore = configureStore([])
  const initialState = {
    auth: {
      userPoints: 1234,
      userPrincipal: 'abcd-1234-efgh-5678',
    },
  }
  const store = mockStore(initialState)

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <ChakraProvider>
          <NavbarUser />
        </ChakraProvider>
      </Provider>,
    )

  it('renders the user principal and points correctly', () => {
    renderComponent()

    const userPrincipal = screen.getByText('abcd')
    expect(userPrincipal).toBeInTheDocument()

    const userPoints = screen.getByText('1,234')
    expect(userPoints).toBeInTheDocument()
  })

  it('displays the menu with user principal details when clicked', () => {
    renderComponent()

    const menuButton = screen.getByRole('button', { name: /info/i })
    fireEvent.click(menuButton)

    const userPrincipalDetails = screen.getByText(
      /User principal: abcd-1234-efgh-5678/i,
    )
    expect(userPrincipalDetails).toBeInTheDocument()

    const warningText = screen.getByText(/Do not send funds here!/i)
    expect(warningText).toBeInTheDocument()
  })

  it('does not render points if userPoints is undefined', () => {
    const stateWithoutPoints = {
      auth: {
        userPoints: undefined,
        userPrincipal: 'abcd-1234-efgh-5678',
      },
    }
    const storeWithoutPoints = mockStore(stateWithoutPoints)

    render(
      <Provider store={storeWithoutPoints}>
        <ChakraProvider>
          <NavbarUser />
        </ChakraProvider>
      </Provider>,
    )

    const userPoints = screen.queryByText('1,234')
    expect(userPoints).not.toBeInTheDocument()
  })
})
