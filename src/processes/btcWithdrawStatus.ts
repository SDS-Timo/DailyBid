import { useEffect, useRef, useState } from 'react'

import { useToast } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

import useWallet from '../hooks/useWallet'
import { RootState } from '../store'
import { getToastDescriptionWithLink } from '../utils/uiUtils'

const BtcWithdrawStatusComponent: React.FC = () => {
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )
  const isWithdrawStarted = useSelector(
    (state: RootState) => state.balances.isWithdrawStarted,
  )
  const { btcWithdrawStatus } = useWallet()

  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })

  const isFetchingRef = useRef<boolean>(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [, setStatusList] = useState<
    { blockIndex: bigint; status: string; txid: string | null }[]
  >([])
  const [pendingToasts, setPendingToasts] = useState<
    { blockIndex: bigint; status: string; txid: string | null }[]
  >([])

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
            ? Array.from(statusValue.txid as Uint8Array)
                .reverse()
                .map((byte: number) => byte.toString(16).padStart(2, '0'))
                .join('')
            : null

        return { blockIndex, status: statusKey, txid }
      })

      const results = await Promise.all(statusPromises)

      setStatusList((prevStatusList) => {
        const updatedStatusList = [...prevStatusList]
        const newToasts: {
          blockIndex: bigint
          status: string
          txid: string | null
        }[] = []

        results.forEach(({ blockIndex, status, txid }) => {
          const existingEntry = updatedStatusList.find(
            (entry) => entry.blockIndex === blockIndex,
          )

          if (!existingEntry || existingEntry.status !== status) {
            if (existingEntry) {
              existingEntry.status = status
            } else {
              updatedStatusList.push({ blockIndex, status, txid })
            }

            newToasts.push({ blockIndex, status, txid })

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
      pendingToasts.forEach(({ status, txid }) => {
        const isSubmitted = status.includes('Submitted')
        const isPending = status.includes('Pending')
        if (isSubmitted || isPending) {
          toast({
            title: isSubmitted
              ? 'BTC withdraw done'
              : 'BTC withdraw in progress',
            description: txid
              ? getToastDescriptionWithLink(
                  status,
                  `View transaction`,
                  `https://mempool.space/tx/${txid}`,
                )
              : status,
            status: isSubmitted ? 'success' : 'loading',
            duration: 10000,
            isClosable: true,
          })
        }
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
            txid: null,
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
