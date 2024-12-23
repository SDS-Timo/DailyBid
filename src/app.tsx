import React from 'react'

import { HelmetProvider, Helmet } from 'react-helmet-async'
import { useRoutes } from 'react-router-dom'

import './languages/i18n'
import routes from './routes'

const App: React.FC = () => {
  const content = useRoutes(routes)

  return (
    <HelmetProvider>
      <Helmet titleTemplate="%s" defaultTitle="DailyBid" />
      {content}
    </HelmetProvider>
  )
}

export default App
