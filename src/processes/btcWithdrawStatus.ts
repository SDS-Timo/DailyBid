import { useEffect, useRef, useState } from 'react'

import { useToast } from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'

import useWallet from '../hooks/useWallet'
import { RootState, AppDispatch } from '../store'
import { setBalances } from '../store/balances'

const BtcWithdrawStatusComponent: React.FC = () => {
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )
  const isWithdrawStarted = useSelector(
    (state: RootState) => state.balances.isWithdrawStarted,
  )
  const dispatch = useDispatch<AppDispatch>()
  const { btcWithdrawStatus, getBalancesCredits } = useWallet()

  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })

  const isFetchingRef = useRef<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [, setStatusList] = useState<{ blockIndex: bigint; status: string }[]>(
    [],
  )
  const [pendingToasts, setPendingToasts] = useState<
    { blockIndex: bigint; status: string }[]
  >([])

  const fetchBalances = async () => {
    const balancesCredits = await getBalancesCredits(userAgent, tokens)

    dispatch(setBalances(balancesCredits))
  }

  const fetchBtcWithdrawStatus = async () => {
    try {
      if (isFetchingRef.current) {
        console.log('Timer blocked by isFetching')
        return
      }

      isFetchingRef.current = true

      const blockIndexStorage: bigint[] = JSON.parse(
        localStorage.getItem('blockIndex') || '[]',
        (key, value) =>
          typeof value === 'string' && /^\d+$/.test(value)
            ? BigInt(value)
            : value,
      )

      if (blockIndexStorage.length === 0) {
        console.log('No block indexes found in storage')

        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return
      }

      const statusPromises = blockIndexStorage.map(async (blockIndex) => {
        const statusResponse = await btcWithdrawStatus(userAgent, blockIndex)

        console.log('btcWithdrawStatusResponse', statusResponse)

        if (!statusResponse || typeof statusResponse !== 'object') {
          return { blockIndex, status: 'Unknown', txid: null }
        }

        const statusKey = Object.keys(statusResponse)[0] || 'Unknown'
        const statusValue = (statusResponse as Record<string, any>)[statusKey]

        const txid =
          statusValue && 'txid' in statusValue
            ? Array.isArray(statusValue.txid)
              ? statusValue.txid.join('')
              : statusValue.txid.toString()
            : null

        return { blockIndex, status: statusKey, txid }
      })

      const results = await Promise.all(statusPromises)

      setStatusList((prevStatusList) => {
        const updatedStatusList = [...prevStatusList]
        const newToasts: { blockIndex: bigint; status: string }[] = []

        results.forEach(({ blockIndex, status }) => {
          const existingEntry = updatedStatusList.find(
            (entry) => entry.blockIndex === blockIndex,
          )

          if (!existingEntry || existingEntry.status !== status) {
            if (existingEntry) {
              existingEntry.status = status
            } else {
              updatedStatusList.push({ blockIndex, status })
            }

            newToasts.push({ blockIndex, status })

            if (status.includes('Submitted')) {
              const updatedBlockIndexStorage = blockIndexStorage.filter(
                (index) => index !== blockIndex,
              )

              localStorage.setItem(
                'blockIndex',
                JSON.stringify(updatedBlockIndexStorage, (key, value) =>
                  typeof value === 'bigint' ? value.toString() : value,
                ),
              )

              fetchBalances()
            }
          }
        })

        setPendingToasts(newToasts)
        return updatedStatusList
      })
    } catch (error) {
      console.error('Error processing btcWithdrawStatus:', error)
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 100))
      isFetchingRef.current = false
    }
  }

  useEffect(() => {
    if (pendingToasts.length > 0) {
      pendingToasts.forEach(({ status }) => {
        const isSubmitted = status.includes('Submitted')
        toast({
          title: isSubmitted ? 'BTC withdraw done' : 'BTC withdraw in progress',
          description: status,
          status: isSubmitted ? 'success' : 'loading',
          duration: 10000,
          isClosable: true,
        })
      })
      setPendingToasts([])
    }
  }, [pendingToasts])

  useEffect(() => {
    if (userPrincipal) {
      const blockIndexStorage: bigint[] = JSON.parse(
        localStorage.getItem('blockIndex') || '[]',
        (key, value) =>
          typeof value === 'string' && /^\d+$/.test(value)
            ? BigInt(value)
            : value,
      )

      if (blockIndexStorage.length > 0) {
        console.log('Found blockIndex in localStorage:', blockIndexStorage)

        setStatusList(
          blockIndexStorage.map((blockIndex) => ({
            blockIndex,
            status: 'Pending',
          })),
        )

        if (!intervalRef.current) {
          fetchBtcWithdrawStatus()
          intervalRef.current = setInterval(fetchBtcWithdrawStatus, 60000)
        }
      }
    }
  }, [userPrincipal])

  useEffect(() => {
    if (userPrincipal && !intervalRef.current) {
      fetchBtcWithdrawStatus()

      intervalRef.current = setInterval(() => {
        fetchBtcWithdrawStatus()
      }, 60000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isWithdrawStarted])

  return null
}

export default BtcWithdrawStatusComponent
