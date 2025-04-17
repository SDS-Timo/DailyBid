/* import React, { useEffect } from 'react'

// eslint-disable-next-line node/no-extraneous-import
import { useTokens } from 'icrc84-package'
import { useSelector } from 'react-redux'

import { idlFactory as Icrc84IDLFactory } from '../../../declarations/icrc1_auction/icrc1_auction.did'
import { RootState } from '../../store'

const TestComponent: React.FC = () => {
  const { userAgent } = useSelector((state: RootState) => state.auth)

  const canisterId = `${process.env.CANISTER_ID_ICRC_AUCTION}`

  const { getTokens } = useTokens(userAgent, canisterId, Icrc84IDLFactory)

  const fetchTokens = async () => {
    try {
      const { tokens, quoteToken } = await getTokens()

      console.log('Tokens:', tokens)
      console.log('Quote Token:', quoteToken)
    } catch (error) {
      console.error('Error fetching tokens:', error)
    }
  }
  useEffect(() => {
    fetchTokens()
  }, [])

  return <></>
}

export default TestComponent
 */
