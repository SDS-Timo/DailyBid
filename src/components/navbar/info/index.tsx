import React, { useEffect, useCallback } from 'react'

import { InfoIcon } from '@chakra-ui/icons'
import {
  IconButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Box,
  Text,
  useToast,
  useColorModeValue,
  useClipboard,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'

import useOrder from '../../../hooks/useOrders'
import { RootState, AppDispatch } from '../../../store'
import { setOrderSettings } from '../../../store/orders'
import { getAuctionCanisterId } from '../../../utils/canisterUtils'

const NavbarInfo: React.FC = () => {
  const toast = useToast({
    duration: 2000,
    position: 'top-right',
    isClosable: true,
  })
  const dispatch = useDispatch<AppDispatch>()
  const principal = getAuctionCanisterId()
  const { t } = useTranslation()

  const bgColor = useColorModeValue('grey.100', 'grey.900')
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')

  const { userAgent } = useSelector((state: RootState) => state.auth)
  const selectedQuote = useSelector(
    (state: RootState) => state.tokens.selectedQuote,
  )
  const orderSettings = useSelector(
    (state: RootState) => state.orders.orderSettings,
  )

  const { onCopy: onCopyAuctionPrincipal } = useClipboard(principal)
  const { onCopy: onCopyQuotePrincipal } = useClipboard(
    `${selectedQuote.principal}`,
  )

  const copyToClipboard = useCallback(
    (text: string, description: string) => {
      if (text === 'auctionPrincipal') onCopyAuctionPrincipal()
      else if (text === 'quotePrincipal') onCopyQuotePrincipal()

      toast({
        position: 'top-right',
        title: t('Copied'),
        description,
        status: 'success',
      })
    },
    [toast],
  )

  const getMinimumOrder = useCallback(async () => {
    if (userAgent && selectedQuote) {
      const { getOrderSettings } = useOrder()

      const settings = await getOrderSettings(userAgent, selectedQuote)

      dispatch(setOrderSettings(settings))
    }
  }, [selectedQuote, dispatch])

  useEffect(() => {
    getMinimumOrder()
  }, [getMinimumOrder])

  return (
    <Flex alignItems="center" zIndex="10">
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Info"
          icon={<InfoIcon />}
          variant="unstyled"
          _hover={{ bg: 'transparent' }}
          _focus={{ outline: 'none' }}
        />
        <MenuList bg={bgColor} p={4}>
          <Box>
            <Text as="strong" fontSize="14px">
              {t('Backend')}:
            </Text>
            <Flex alignItems="center">
              <Text
                ml={1}
                fontSize="13px"
                onClick={() =>
                  copyToClipboard(
                    'auctionPrincipal',
                    t('Backend principal copied to clipboard'),
                  )
                }
                cursor="pointer"
                p={1}
                border="1px solid transparent"
                borderRadius="md"
                _hover={{
                  borderColor: bgColorHover,
                  borderRadius: 'md',
                }}
              >
                {principal}
              </Text>
            </Flex>
          </Box>
          {selectedQuote.principal && (
            <Box>
              <Text as="strong" fontSize="14px">
                {t('Quote token ledger')}{' '}
              </Text>
              <Text as="strong" fontSize="11px">
                ({selectedQuote.base}):
              </Text>
              <Flex alignItems="center">
                <Text
                  ml={1}
                  fontSize="13px"
                  onClick={() =>
                    copyToClipboard(
                      'quotePrincipal',
                      t('Quote token principal copied to clipboard'),
                    )
                  }
                  cursor="pointer"
                  p={1}
                  border="1px solid transparent"
                  borderRadius="md"
                  _hover={{
                    borderColor: bgColorHover,
                    borderRadius: 'md',
                  }}
                >
                  {selectedQuote.principal}
                </Text>
              </Flex>
            </Box>
          )}
          <Box>
            <Text as="strong" fontSize="14px">
              {t('Order size')}:
            </Text>
            <Text ml={1} fontSize="13px">
              {orderSettings.orderQuoteVolumeMinimum} {selectedQuote.base}{' '}
              {t('minimum')}
            </Text>
            <Text ml={1} fontSize="13px">
              {orderSettings.orderQuoteVolumeStep} {selectedQuote.base}{' '}
              {t('step size')}
            </Text>
          </Box>
          <Box>
            <Text as="strong" fontSize="14px">
              {t('Price precision:')}
            </Text>
            <Text ml={1} fontSize="13px">
              {orderSettings.orderPriceDigitsLimit} {t('significant digits')}
            </Text>
          </Box>
        </MenuList>
      </Menu>
    </Flex>
  )
}

export default NavbarInfo
