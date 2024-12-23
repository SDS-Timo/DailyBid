import { Buffer } from 'buffer'

import { ChakraProvider } from '@chakra-ui/react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import App from './app'
import store from './store'
import theme from './theme'

if (!window.Buffer) window.Buffer = Buffer

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </Provider>
  </BrowserRouter>,
)
