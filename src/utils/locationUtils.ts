export const getLocation = async (): Promise<string> => {
  try {
    const res = await fetch('https://geolocation-db.com/json/')
    const data = await res.json()
    return `${data.country_name} - ${data.state}`
  } catch {
    return 'Unknown'
  }
}

export const getLocationWhoIs = async (): Promise<string> => {
  try {
    const res = await fetch('https://ipwho.is/')
    const data = await res.json()
    if (!data.success) throw new Error()
    return `${data.country} - ${data.region}`
  } catch {
    return 'Unknown'
  }
}
