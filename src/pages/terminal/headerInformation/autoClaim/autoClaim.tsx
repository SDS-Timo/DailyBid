import { Principal } from '@dfinity/principal'
import { useSelector, useDispatch } from 'react-redux'

import useWallet from '../../../../hooks/useWallet'
import { RootState, AppDispatch } from '../../../../store'
import { setBalances } from '../../../../store/balances'
import { ClaimTokenBalance } from '../../../../types'
import { getToken } from '../../../../utils/tokenUtils'

export const useHandleAllTrackedDeposits = () => {
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const { getTrackedDeposit, getBalance, balanceNotify, getBalancesCredits } =
    useWallet()
  const dispatch = useDispatch<AppDispatch>()

  const fetchBalances = async () => {
    const balancesCredits = await getBalancesCredits(userAgent, tokens)
    dispatch(setBalances(balancesCredits))
    return balancesCredits
  }

  const handleNotify = async (principal: string | undefined) => {
    await balanceNotify(userAgent, principal)
  }

  const handleAllTrackedDeposits = async (userPrincipal: string) => {
    const balances = await fetchBalances()

    const trackedDeposit = await getTrackedDeposit(userAgent, tokens, '')

    const tokensBalance: ClaimTokenBalance[] = []
    await Promise.all(
      balances.map(async (token) => {
        const balanceOf = await getBalance(
          userAgent,
          [token],
          `${token.principal}`,
          userPrincipal,
          'claim',
        )

        const tokenDeposit =
          trackedDeposit.find(
            (item: { token: { base: string } }) =>
              item.token.base === token.base,
          ) || null

        const deposit = tokenDeposit ? tokenDeposit.volumeInBase : 0

        if (
          typeof balanceOf === 'number' &&
          typeof deposit === 'number' &&
          !isNaN(balanceOf) &&
          !isNaN(deposit)
        ) {
          const available = balanceOf - deposit
          if (available > 0) {
            tokensBalance.push({
              principal: `${token?.principal}`,
              base: token?.base,
              available,
            })
          }
        }
      }),
    )

    if (tokensBalance.length > 0) {
      await Promise.all(
        tokensBalance.map(async (token) => {
          const tokenInfo = getToken(
            tokens,
            Principal.fromText(token.principal),
          )

          if (token.available >= Number(tokenInfo.fee)) {
            await handleNotify(token.principal)
          }
        }),
      )

      await fetchBalances()
    }

    return tokensBalance
  }

  return { handleAllTrackedDeposits }
}
