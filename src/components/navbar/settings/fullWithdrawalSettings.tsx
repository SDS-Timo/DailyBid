import React, { useCallback } from 'react'

import {
  Flex,
  Input,
  InputGroup,
  FormControl,
  FormLabel,
  Button,
  Spinner,
  Text,
  useToast,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useFormik } from 'formik'
import { useSelector, useDispatch } from 'react-redux'
import * as Yup from 'yup'

import useOrders from '../../../hooks/useOrders'
import useWallet from '../../../hooks/useWallet'
import { RootState, AppDispatch } from '../../../store'
import { setIsRefreshBalances } from '../../../store/balances'
import { setIsRefreshUserData } from '../../../store/orders'
import { decodeIcrcAccountText } from '../../../utils/convertionsUtils'
import { getErrorMessageManageOrders } from '../../../utils/orderUtils'
import { getErrorMessageWithdraw } from '../../../utils/walletUtils'
import WithdrawalsConfirmationModal from '../../confirmationModal'

const fullWithdrawSettings: React.FC = () => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const buttonBgColor = useColorModeValue('grey.500', 'grey.600')
  const fontColor = useColorModeValue('grey.25', 'grey.25')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const dispatch = useDispatch<AppDispatch>()

  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })

  const { userAgent } = useSelector((state: RootState) => state.auth)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)

  const fetchManageOrders = useCallback(async () => {
    const { manageOrders } = useOrders()
    return await manageOrders(userAgent)
  }, [userAgent])

  const fetchWithdrawals = useCallback(
    async (account: string) => {
      const { getBalancesCredits, withdrawCredit } = useWallet()

      try {
        const balancesCredits = await getBalancesCredits(userAgent, tokens)

        const withdrawalPromises = balancesCredits
          .filter((balance) => Number(balance.volumeInTotalNat) > 0)
          .map(async (balance) => {
            const response = await withdrawCredit(
              userAgent,
              balance.principal,
              account,
              Number(balance.volumeInTotalNat),
            )

            return {
              balance,
              response,
            }
          })

        const results = await Promise.all(withdrawalPromises)

        const errors = results.filter(
          ({ response }) => response && 'Err' in response,
        )
        const successes = results.filter(
          ({ response }) => response && 'Ok' in response,
        )

        return { errors, successes }
      } catch (error) {
        return { Err: error }
      }
    },
    [userAgent, tokens],
  )

  const validateAddress = useCallback((address: string) => {
    try {
      const account = decodeIcrcAccountText(address)
      if (!account) {
        return false
      }
      return true
    } catch {
      return false
    }
  }, [])

  const initialValues = {
    destinationAccount: '',
    submit: false,
  }

  const validationSchema = Yup.object().shape({
    destinationAccount: Yup.string()
      .required('Address is required')
      .test('is-valid-address', 'Invalid Address', function (value) {
        return validateAddress(value)
      })
      .typeError('Invalid Address format'),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async () => {
      onOpen()
    },
  })

  const handleWithdrawConfirm = async () => {
    try {
      onClose()

      let toastId = toast({
        title: 'Manage orders pending',
        description: 'Please wait',
        status: 'loading',
        duration: null,
        isClosable: true,
      })

      const response = await fetchManageOrders()

      if (Object.keys(response).includes('Ok')) {
        if (toastId) {
          toast.update(toastId, {
            title: 'Success',
            description: 'Manage orders done',
            status: 'success',
            isClosable: true,
          })
        }

        dispatch(setIsRefreshUserData())
      } else {
        if (toastId) {
          const description =
            'Err' in response
              ? getErrorMessageManageOrders(response.Err)
              : 'Unknown error'
          toast.update(toastId, {
            title: 'Manage orders rejected',
            description,
            status: 'error',
            isClosable: true,
          })
        }
        return
      }

      toastId = toast({
        title: 'Full withdrawal pending',
        description: 'Please wait',
        status: 'loading',
        duration: null,
        isClosable: true,
      })

      const result = await fetchWithdrawals(formik.values.destinationAccount)

      if (toastId) {
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors
            .map(({ balance, response }) => {
              const errorType = response
                ? 'Err' in response
                  ? getErrorMessageWithdraw(response.Err)
                  : 'Unknown error'
                : 'Unknown error'
              return `Error for withdrawal ${balance.symbol}: ${errorType}`
            })
            .join('\n')

          toast.update(toastId, {
            title: 'Full withdrawal rejected',
            description: (
              <div style={{ whiteSpace: 'pre-line' }}>{errorMessages}</div>
            ),
            status: 'error',
            isClosable: true,
          })
        } else if (result.successes && result.successes.length > 0) {
          toast.update(toastId, {
            title: 'Success',
            description: 'Full withdrawal done',
            status: 'success',
            isClosable: true,
          })

          dispatch(setIsRefreshBalances())
        } else {
          toast.update(toastId, {
            title: 'No withdrawal made',
            description: 'Insufficient balance in all assets.',
            status: 'warning',
            isClosable: true,
          })
        }
      }

      formik.setStatus({ success: true })
      formik.setSubmitting(false)
    } catch (error) {
      formik.setStatus({ success: false })
      formik.setSubmitting(false)

      formik.setFieldError('destinationAccount', 'Auction canister call error')
    }
  }

  return (
    <>
      <InputGroup>
        <FormControl variant="floating">
          <Input
            h="58px"
            placeholder=" "
            name="destinationAccount"
            isInvalid={
              !!formik.errors.destinationAccount &&
              formik.touched.destinationAccount
            }
            isDisabled={false}
            value={formik.values.destinationAccount}
            onChange={(e) => formik.handleChange(e)}
          />
          <FormLabel color="grey.500" fontSize="15px">
            Destination account
          </FormLabel>
        </FormControl>
      </InputGroup>
      {!!formik.errors.destinationAccount &&
        formik.touched.destinationAccount && (
          <Text color="red.500" fontSize="12px">
            {formik.errors.destinationAccount}
          </Text>
        )}
      <Flex direction="column" mt={4}>
        <Button
          background={buttonBgColor}
          variant="solid"
          h="58px"
          color={fontColor}
          _hover={{
            bg: bgColorHover,
            color: fontColor,
          }}
          isDisabled={formik.isSubmitting}
          onClick={() => formik.handleSubmit()}
        >
          {formik.isSubmitting ? (
            <>
              Withdraw <Spinner ml={2} size="sm" color={fontColor} />
            </>
          ) : (
            'Withdraw'
          )}
        </Button>
      </Flex>

      <WithdrawalsConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleWithdrawConfirm}
        title="Confirm Withdraw"
        description={
          <>
            <Text>Are you sure you want to full withdraw to address</Text>
            <Text mt={3}>
              <strong>{formik.values.destinationAccount}</strong>?
            </Text>
            <Text mt={3}>This action cannot be undone.</Text>
          </>
        }
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </>
  )
}

export default fullWithdrawSettings
