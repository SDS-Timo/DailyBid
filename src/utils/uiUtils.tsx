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
        {`Duration: ${formattedDuration}s`}
      </div>
    </>
  )
}
