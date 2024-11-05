/**
 * Retrieves all available time zones supported by the user's environment.
 * Formats each time zone as an object with `value` and `label` properties for easier use in select components or displays.
 */
export const getAllTimezones = () => {
  return Intl.supportedValuesOf('timeZone').map((tz) => ({
    id: tz,
    value: tz,
    label: tz.replace('_', ' '),
  }))
}
