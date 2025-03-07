import { useEffect, useRef } from 'react'

import { useToast } from '@chakra-ui/react'
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

  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })

  const { getCkBtcMinter, ckBtcMinterUpdateBalance } = useCkBtcMinter()

  const isFetchingRef = useRef<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousCkBtcUtxoRef = useRef<Set<string>>(new Set())
  const previousNewBtcUtxoRef = useRef<Set<string>>(new Set())

  const detectNewTxids = (
    previousRef: React.MutableRefObject<Set<string>>,
    currentList: { txid: string; amount: number }[],
    title: string,
    getDescription: (newTxids: { txid: string; amount: number }[]) => string,
    status: 'info' | 'warning' | 'success' | 'error' | 'loading' | undefined,
  ) => {
    const previousSet = previousRef.current

    const newTxids = currentList.filter((tx) => !previousSet.has(tx.txid))

    if (newTxids.length > 0) {
      toast({
        title,
        description: getDescription(newTxids),
        status,
        duration: 10000,
        isClosable: true,
      })

      previousRef.current = new Set([
        ...previousSet,
        ...newTxids.map((tx) => tx.txid),
      ])
    }
  }

  const fetchCkBtcUtxos = async () => {
    try {
      if (userPrincipal) {
        const list = await getCkBtcMinter(userAgent, userPrincipal, tokens)

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

      detectNewTxids(
        previousNewBtcUtxoRef,
        newBtcUtxo,
        'New BTC deposit found',
        (newTxids) =>
          `${newTxids.reduce((sum, tx) => sum + Number(tx.amount), 0)} BTC pending`,
        'success',
      )

      detectNewTxids(
        previousCkBtcUtxoRef,
        ckBtcUtxo,
        'BTC deposit done',
        (newTxids) =>
          `${newTxids.reduce((sum, tx) => sum + Number(tx.amount), 0)} BTC received`,
        'success',
      )

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
    if (userBtcDeposit) {
      fetchUtxos()

      intervalRef.current = setInterval(() => {
        fetchUtxos()
      }, 60000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [userBtcDeposit])

  useEffect(() => {
    if (userPrincipal) {
      fetchCkBtcUtxos()
    }
  }, [userPrincipal])

  useEffect(() => {
    localStorage.removeItem('ckBtcUtxo')
  }, [])

  return null
}

export default BtcDepositComponent
