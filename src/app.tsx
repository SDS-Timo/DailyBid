import React, { useEffect } from 'react'

import { HelmetProvider, Helmet } from 'react-helmet-async'
import { useRoutes } from 'react-router-dom'

import useWindow from './hooks/useWindow'
import './languages/i18n'
import routes from './routes'

const App: React.FC = () => {
  const content = useRoutes(routes)
  const { getIsTelegramApp } = useWindow()
  const { isTelegram } = getIsTelegramApp()

  useEffect(() => {
    if (isTelegram) {
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-web-app.js'
      script.async = true
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }
  }, [isTelegram])

  return (
    <HelmetProvider>
      <Helmet titleTemplate="%s" defaultTitle="DailyBid" />
      {content}
    </HelmetProvider>
  )
}

export default App
