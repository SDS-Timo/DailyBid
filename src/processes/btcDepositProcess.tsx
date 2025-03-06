import { useEffect, useRef } from 'react'

import { differenceInSeconds } from 'date-fns'
import { useSelector } from 'react-redux'

import useCkBtcMinter from '../hooks/useCkBtcMinter'
import { RootState } from '../store'
import { getMemPoolUtxos } from '../utils/walletUtils'

const BtcDepositComponent: React.FC = () => {
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )
  const userBtcDeposit = useSelector(
    (state: RootState) => state.auth.userBtcDepositAddress,
  )

  const { getCkBtcMinter, ckBtcMinterUpdateBalance } = useCkBtcMinter()

  const isFetchingRef = useRef<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchCkBtcUtxos = async () => {
    try {
      if (userPrincipal) {
        const list = await getCkBtcMinter(userAgent, userPrincipal)

        localStorage.setItem(
          'ckBtcUtxo',
          JSON.stringify(list, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value,
          ),
        )
      }
    } catch (error) {
      console.error('Error processing CkBtc Minter UTXOs:', error)
    }
  }

  const fetchUtxos = async () => {
    try {
      if (isFetchingRef.current) {
        console.log('Timer blocked by isFetching')
        return
      }

      isFetchingRef.current = true

      const ckBtcUtxo = JSON.parse(
        localStorage.getItem('ckBtcUtxo') || '[]',
        (key, value) =>
          typeof value === 'string' && /^\d+$/.test(value)
            ? BigInt(value)
            : value,
      )

      console.log('ckBtcUtxo timer: ', ckBtcUtxo)
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
            const response = await ckBtcMinterUpdateBalance(
              userAgent,
              userPrincipal,
            )
            console.log('update_balance_response: ', response)

            await fetchCkBtcUtxos()
          }
        }
      }
    } catch (error) {
      console.error('Error processing UTXOs:', error)
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 100))
      isFetchingRef.current = false
    }
  }

  useEffect(() => {
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
    if (userPrincipal) {
      localStorage.removeItem('ckBtcUtxo')
      fetchCkBtcUtxos()
    }
  }, [userPrincipal])

  return null
}

export default BtcDepositComponent
