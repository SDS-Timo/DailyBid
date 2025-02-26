/**
 * Custom hook to fetch and manage Bitcoin Mempool information.
 */
const useMempool = () => {
  /**
   * Fetches the list of UTXOs (Unspent Transaction Outputs) for a given Bitcoin address.
   *
   * @param address - The Bitcoin address for which UTXOs will be retrieved.
   * @returns A promise that resolves to the list of UTXOs associated with the address.
   */
  const getMempoolAdressUtxo = async (address: string) => {
    try {
      const url = `https://mempool.space/api/address/${address}/utxo`
      const response = await fetch(url)

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error fetching UTXOs from Mempool:', err)
      return {}
    }
  }

  /**
   * Fetches the current block height of the Bitcoin blockchain.
   *
   * @returns A promise that resolves to the latest block height.
   */
  const getCurrentBlockHeight = async () => {
    try {
      const url = 'https://mempool.space/api/blocks/tip/height'
      const response = await fetch(url)
      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error fetching current block height:', err)
      return null
    }
  }

  return { getMempoolAdressUtxo, getCurrentBlockHeight }
}

export default useMempool
