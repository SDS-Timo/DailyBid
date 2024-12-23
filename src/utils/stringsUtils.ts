/**
 * Capitalizes the first letter of the given string.
 * @param text - The input string to be modified.
 * @returns - A new string with the first letter in uppercase and the rest unchanged.
 */
export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
