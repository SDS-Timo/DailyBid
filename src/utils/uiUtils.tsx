import i18next from 'i18next'

/**
 * Generates a simple toast description with a message and formatted duration.
 * @param message - The main message to display in the toast.
 * @param durationInSeconds - The duration to display, formatted to one decimal place.
 * @returns - A React element containing the formatted message and duration.
 */
export const getSimpleToastDescription = (
  message: string,
  durationInSeconds: number,
) => {
  const formattedDuration = durationInSeconds.toFixed(1)

  return (
    <>
      <div>{message}</div>
      <div
        style={{
          fontSize: '0.8em',
          textAlign: 'right',
          marginTop: '0.5em',
        }}
      >
        {`${i18next.t('Duration')}: ${formattedDuration}s`}
      </div>
    </>
  )
}

/**
 * Generates a formatted toast description with two message lines and a duration indicator.
 * @param messageLine1 - The first line of the message.
 * @param messageLine2 - The second line of the message.
 * @param durationInSeconds - The duration to display, formatted to one decimal place.
 * @returns - A React element containing the formatted message and duration.
 */
export const getDoubleLineToastDescription = (
  messageLine1: string,
  messageLine2: string,
  durationInSeconds: number,
) => {
  const formattedDuration = durationInSeconds.toFixed(1)

  return (
    <>
      <div>{messageLine1}</div>
      <div>{messageLine2}</div>
      <div
        style={{
          fontSize: '0.8em',
          textAlign: 'right',
          marginTop: '0.5em',
        }}
      >
        {`${i18next.t('Duration')}: ${formattedDuration}s`}
      </div>
    </>
  )
}

/**
 * Generates a formatted toast description with a message and a clickable link.
 * @param message - The main message displayed in the toast.
 * @param messageLink - The text displayed for the clickable link.
 * @param link - The URL that the link should navigate to.
 * @returns - A React element containing the formatted message and duration.
 */
export const getToastDescriptionWithLink = (
  message: string,
  messageLink: string,
  link: string,
) => {
  return (
    <>
      <div>{message}</div>
      <div
        style={{
          fontSize: '0.8em',
          textAlign: 'right',
          marginTop: '0.5em',
        }}
      >
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          style={{
            all: 'unset',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
            textAlign: 'right',
            pointerEvents: 'all',
          }}
        >
          {messageLink}
        </a>
      </div>
    </>
  )
}
