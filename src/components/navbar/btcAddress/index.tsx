import { useEffect, useCallback, useRef } from 'react'

import { differenceInSeconds } from 'date-fns'
import { useSelector, useDispatch } from 'react-redux'

import useCkBtcMinter from '../../../hooks/useCkBtcMinter'
import useMempool from '../../../hooks/useMempoolApi'
import { RootState, AppDispatch } from '../../../store'
import { setCkBtcUtxo, setNewBtcUtxo } from '../../../store/balances'
import { convertVolumeFromCanister } from '../../../utils/calculationsUtils'

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
  const { getMempoolAdressUtxo, getCurrentBlockHeight } = useMempool()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateUtxoConfirmations = async (utxos: any[]) => {
    try {
      const currentBlockHeight = await getCurrentBlockHeight()
      if (!currentBlockHeight) {
        console.error('Failed to fetch current block height.')
        return utxos
      }

      return utxos.map((utxo) => ({
        ...utxo,
        confirmations: utxo.status.confirmed
          ? currentBlockHeight - utxo.status.block_height + 1
          : 0,
      }))
    } catch (err) {
      console.error('Error calculating UTXO confirmations:', err)
      return utxos
    }
  }

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
      if (userPrincipal && userBtcDeposit) {
        const mempoolUtxos = await getMempoolAdressUtxo(userBtcDeposit)
        if (mempoolUtxos.length === 0) return

        const mempoolUtxosWithConfirmations =
          await calculateUtxoConfirmations(mempoolUtxos)

        const knownTxids = new Set(ckBtcUtxo.map((utxo: any) => utxo.txid))

        const newUtxos = mempoolUtxosWithConfirmations
          .filter((utxo) => !knownTxids.has(utxo.txid))
          .map((utxo) => {
            const { volumeInBase } = convertVolumeFromCanister(
              Number(utxo.value),
              tokens.find((token) => token.base === 'BTC')?.decimals || 8,
              0,
            )

            return {
              height: utxo.status.block_height,
              block_time: utxo.status.block_time,
              txid: utxo.txid,
              amount: volumeInBase,
              confirmations: utxo.confirmations || 0,
            }
          })

        dispatch(setNewBtcUtxo(newUtxos))

        for (const utxo of newUtxos) {
          if (!knownTxids.has(utxo.txid)) {
            const blockTime = utxo.block_time
            const confirmationCount = utxo.confirmations || 0

            if (blockTime && confirmationCount >= 6) {
              const timeElapsed = differenceInSeconds(
                new Date(),
                new Date(blockTime * 1000),
              )

              if (timeElapsed > 60) {
                await ckBtcMinterUpdateBalance(userAgent, userPrincipal)
                await fetchCkBtcUtxos()
                break
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing UTXOs:', error)
    }
  }, [
    fetchCkBtcUtxos,
    getMempoolAdressUtxo,
    ckBtcMinterUpdateBalance,
    ckBtcUtxo,
    userAgent,
    userPrincipal,
    userBtcDeposit,
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

  return null
}

export default MempoolWebSocketComponent
