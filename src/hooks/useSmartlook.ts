import { useEffect } from 'react'

export function useSmartlook() {
  useEffect(() => {
    if (import.meta.env.PROD) {
      if (!window.smartlook) {
        ;(function (d) {
          const o: any = function (...args: any[]) {
            o.api.push(args)
          }
          o.api = []
          window.smartlook = o
          const c = d.createElement('script')
          c.async = true
          c.type = 'text/javascript'
          c.src = 'https://web-sdk.smartlook.com/recorder.js'
          d.getElementsByTagName('head')[0].appendChild(c)
        })(document)
      }

      window.smartlook('init', '6b92cb2721800710b6ef8f13592496843c2a47f1', {
        region: 'eu',
      })
    }
  }, [])
}
