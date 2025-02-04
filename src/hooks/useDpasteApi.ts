/**
 * Custom hook to interact with the Dpaste API.
 *
 * This hook provides functions to save text snippets to Dpaste with authentication
 * and retrieve private snippets using their unique codes.
 */
const useDPasteApi = () => {
  /**
   * Saves a text snippet to Dpaste with authentication.
   *
   * @param content - The text content to be saved as a snippet.
   * @returns - A promise that resolves to the snippet's unique code.
   * @throws - Throws an error if the request to Dpaste fails.
   */
  async function saveToDpasteWithAuth(content: any) {
    try {
      const API_TOKEN = process.env.ENV_DPASTE_API_KEY

      const response = await fetch('https://dpaste.com/api/v2/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          content,
          lexer: 'text',
          expiry_days: '1',
          visibility: 'private',
        }).toString(),
      })

      if (!response.ok) {
        throw new Error(`Failed to save to dpaste.com: ${response.statusText}`)
      }

      const result = await response.text()

      const code = new URL(result).pathname.replace('/', '')

      return code
    } catch (error) {
      console.error('Error saving to dpaste.com with auth:', error)
      throw error
    }
  }

  /**
   * Retrieves a private snippet from Dpaste using its unique code.
   *
   * @param snippetCode - The unique identifier of the snippet.
   * @returns - A promise that resolves to the snippet content.
   * @throws - Throws an error if the snippet cannot be retrieved.
   */
  async function readPrivateSnippetFromDpaste(snippetCode: string) {
    try {
      const snippetUrl = `https://dpaste.com/${snippetCode}.txt`

      const API_TOKEN = process.env.ENV_DPASTE_API_KEY

      const response = await fetch(snippetUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch snippet: ${response.statusText}`)
      }

      const snippetContent = await response.text()
      return snippetContent
    } catch (error: any) {
      console.error('Error reading snippet from dpaste:', error.message)
      throw error
    }
  }

  return { saveToDpasteWithAuth, readPrivateSnippetFromDpaste }
}

export default useDPasteApi
