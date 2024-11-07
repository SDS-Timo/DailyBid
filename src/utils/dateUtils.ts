/**
 * Retrieves all available time zones supported by the user's environment.
 * Formats each time zone as an object with `value` and `label` properties for easier use in select components or displays.
 */
export const getAllTimezones = () => {
  const offsets = Array.from({ length: 27 }, (_, i) => i - 12)
  return offsets.map((offset) => {
    const sign = offset >= 0 ? '+' : ''
    const label = `UTC${sign}${offset}`
    return {
      id: `UTC${sign}${offset}`,
      value: `UTC${sign}${offset}`,
      label,
      offset,
    }
  })
}
