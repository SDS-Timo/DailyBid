import { useEffect, useCallback, useRef } from 'react'

import { differenceInSeconds } from 'date-fns'
import { useSelector, useDispatch } from 'react-redux'

import useCkBtcMinter from '../../../hooks/useCkBtcMinter'
import { RootState, AppDispatch } from '../../../store'
import { setCkBtcUtxo } from '../../../store/balances'
import { getMemPoolUtxos } from '../../../utils/walletUtils'

const MempoolWebSocketComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )
  const userBtcDeposit = useSelector(
    (state: RootState) => state.auth.userBtcDepositAddress,
  )
  const ckBtcUtxo = useSelector((state: RootState) => state.balances.ckBtcUtxo)

  const { getCkBtcMinter, ckBtcMinterUpdateBalance } = useCkBtcMinter()

  const isFetchingRef = useRef<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchCkBtcUtxos = useCallback(async () => {
    try {
      if (userPrincipal) {
        const list = await getCkBtcMinter(userAgent, userPrincipal)
        dispatch(setCkBtcUtxo(list))
      }
    } catch (error) {
      console.error('Error processing CkBtc Minter UTXOs:', error)
    }
  }, [getCkBtcMinter, userAgent, userPrincipal])

  const fetchUtxos = useCallback(async () => {
    try {
      if (isFetchingRef.current) {
        console.log('Timer blocked by isFetching')
        return
      }

      isFetchingRef.current = true

      const newBtcUtxo = await getMemPoolUtxos(
        userBtcDeposit,
        ckBtcUtxo,
        tokens,
      )
      console.log('newBtcUtxo timer: ', newBtcUtxo)

      for (const utxo of newBtcUtxo) {
        const blockTime = utxo.block_time
        const confirmationCount = utxo.confirmations || 0

        if (blockTime && confirmationCount >= 6) {
          const timeElapsed = differenceInSeconds(
            new Date(),
            new Date(blockTime * 1000),
          )

          if (timeElapsed > 60 && userPrincipal) {
            const update_balance_result = await ckBtcMinterUpdateBalance(
              userAgent,
              userPrincipal,
            )
            const get_known_utxos_result = await fetchCkBtcUtxos()

            console.log('update_balance_result: ', update_balance_result)
            console.log('get_known_utxos_result: ', get_known_utxos_result)
          }
        }
      }
    } catch (error) {
      console.error('Error processing UTXOs:', error)
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 100))
      isFetchingRef.current = false
    }
  }, [
    fetchCkBtcUtxos,
    ckBtcMinterUpdateBalance,
    getMemPoolUtxos,
    ckBtcUtxo,
    userAgent,
    userPrincipal,
    userBtcDeposit,
    tokens,
  ])

  useEffect(() => {
    fetchUtxos()

    intervalRef.current = setInterval(() => {
      fetchUtxos()
    }, 60000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [userBtcDeposit])

  useEffect(() => {
    if (userPrincipal) fetchCkBtcUtxos()
  }, [userPrincipal])

  useEffect(() => {
    console.log('get_known_utxos list: ', ckBtcUtxo)
  }, [ckBtcUtxo])

  return null
}

export default MempoolWebSocketComponent
