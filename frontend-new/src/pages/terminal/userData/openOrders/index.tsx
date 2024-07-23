import React, { useEffect, useState } from 'react'

import { CheckIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  useDisclosure,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'

import tableContent from './openOrdersTable'
import AuthComponent from '../../../../components/auth'
import PaginationTable, {
  pgSizeDinamic,
} from '../../../../components/pagination'
import useOpenOrders from '../../../../hooks/useOrders'
import { RootState, AppDispatch } from '../../../../store'
import { setOpenOrders, setIsRefreshOpenOrders } from '../../../../store/orders'
import { TokenDataItem, CancelOrder } from '../../../../types'
import { getErrorMessageCancelOrder } from '../../../../utils/orderUtils'

const OpenOrders: React.FC = () => {
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })
  const dispatch = useDispatch<AppDispatch>()
  const pgSize = pgSizeDinamic()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [openOrdersFiltered, setOpenOrdersFiltered] = useState<TokenDataItem[]>(
    [],
  )
  const [loading, setLoading] = useState(false)
  const [showAllMarkets, setShowAllMarkets] = useState(false)
  const [toggleVolume, setToggleVolume] = useState('quote')
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const isResizeUserData = useSelector(
    (state: RootState) => state.uiSettings.isResizeUserData,
  )
  const isRefreshOpenOrders = useSelector(
    (state: RootState) => state.orders.isRefreshOpenOrders,
  )
  const openOrders = useSelector((state: RootState) => state.orders.openOrders)
  const selectedSymbol = useSelector(
    (state: RootState) => state.tokens.selectedSymbol,
  )
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const symbol = Array.isArray(selectedSymbol)
    ? selectedSymbol[0]
    : selectedSymbol

  async function fetchOpenOrders() {
    if (selectedQuote) {
      setLoading(true)
      const { getOpenOrders } = useOpenOrders()
      const openOrdersRaw = await getOpenOrders(userAgent, selectedQuote)

      dispatch(setOpenOrders(openOrdersRaw))
      filterOpenOrders(openOrdersRaw)
      setLoading(false)
    }
  }

  function filterOpenOrders(openOrders: TokenDataItem[]) {
    if (showAllMarkets) {
      setOpenOrdersFiltered(openOrders)
    } else {
      const filtered = openOrders.filter(
        (openOrder) => openOrder.symbol === symbol?.value,
      )
      setOpenOrdersFiltered(filtered)
    }
  }

  const handleCheckboxChange = (e: boolean) => {
    setShowAllMarkets(e)
  }

  const handleRefreshClick = () => {
    dispatch(setIsRefreshOpenOrders())
  }

  const handleCancelOrderClick = async (
    id: bigint | undefined,
    type: string | undefined,
  ) => {
    const refreshOpenOrders = (action: boolean) => {
      if (!action) dispatch(setIsRefreshOpenOrders())

      setOpenOrdersFiltered((prevState) =>
        prevState.map((order) =>
          order.id === id ? { ...order, action } : order,
        ),
      )
    }

    refreshOpenOrders(true)

    const toastId = toast({
      title: 'Cancel order pending',
      description: 'Please wait',
      status: 'loading',
      duration: null,
      isClosable: true,
      icon: <Spinner size="sm" />,
    })

    const { cancelOrder } = useOpenOrders()
    cancelOrder(userAgent, id, type)
      .then((response: CancelOrder) => {
        if (response.length > 0 && Object.keys(response[0]).includes('Ok')) {
          if (toastId) {
            toast.update(toastId, {
              title: 'Sucess',
              description: 'Order cancelled',
              status: 'success',
              isClosable: true,
              icon: <CheckIcon />,
            })
          }
        } else {
          if (toastId) {
            const description = getErrorMessageCancelOrder(response[0].Err)
            toast.update(toastId, {
              title: 'Cancel order rejected',
              description,
              status: 'error',
              isClosable: true,
              icon: <CloseIcon />,
            })
          }
        }

        refreshOpenOrders(false)
      })
      .catch((error) => {
        const message = error.response ? error.response.data : error.message

        if (toastId) {
          toast.update(toastId, {
            title: 'Cancel order rejected',
            description: `Error: ${message}`,
            status: 'error',
            isClosable: true,
            icon: <CloseIcon />,
          })
        }

        refreshOpenOrders(false)
        console.error('Cancellation failed:', message)
      })
  }

  const handleToggleVolume = () => {
    setToggleVolume((prevState) => (prevState === 'quote' ? 'base' : 'quote'))
  }

  const { tableColumns, hiddenColumns, sortBy } = tableContent(
    toggleVolume,
    handleToggleVolume,
    handleCancelOrderClick,
  )

  useEffect(() => {
    filterOpenOrders(openOrders)
    if (showAllMarkets) setToggleVolume('quote')
  }, [showAllMarkets])

  useEffect(() => {
    if (isAuthenticated) fetchOpenOrders()
  }, [selectedQuote, selectedSymbol, userAgent, isRefreshOpenOrders])

  return (
    <Box
      filter={loading ? 'blur(5px)' : 'none'}
      pointerEvents={loading ? 'none' : 'auto'}
    >
      {!isAuthenticated ? (
        <Flex justifyContent="center" alignItems="center" h="20vh">
          <Button
            onClick={onOpen}
            variant="unstyled"
            _hover={{
              bg: bgColor,
              color: fontColor,
            }}
            fontSize="sm"
            size="sm"
            px="15px"
            isDisabled={!symbol}
          >
            Login or Create Account
          </Button>
          <AuthComponent isOpen={isOpen} onClose={onClose} />
        </Flex>
      ) : (
        <Box>
          <PaginationTable
            columns={tableColumns}
            data={openOrdersFiltered}
            hiddenColumns={hiddenColumns}
            searchBy={true}
            sortBy={sortBy}
            tableSize="sm"
            fontSize="11px"
            emptyMessage="no order found"
            pgSize={isResizeUserData ? 15 : pgSize}
            onClick={(c) => c}
            onClickAllMarkets={handleCheckboxChange}
            onClickRefresh={handleRefreshClick}
          />
        </Box>
      )}
    </Box>
  )
}

export default OpenOrders
