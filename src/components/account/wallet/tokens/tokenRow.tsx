import React, { useState, useEffect, useCallback } from 'react'

import {
  Flex,
  Image,
  Tooltip,
  Text,
  IconButton,
  Spinner,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  FormControl,
  FormLabel,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  useToast,
  useClipboard,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { HttpAgent } from '@dfinity/agent'
import { useFormik } from 'formik'
import { LuDownload, LuUpload } from 'react-icons/lu'
import { RiHandCoinLine } from 'react-icons/ri'
import * as Yup from 'yup'

import useWallet from '../../../../hooks/useWallet'
import { TokenDataItem, TokenMetadata } from '../../../../types'
import {
  fixDecimal,
  convertVolumeFromCanister,
} from '../../../../utils/calculationsUtils'
import WithdrawalsConfirmationModal from '../../../confirmationModal'

interface TokenRowProps {
  token: TokenDataItem
  userAgent: HttpAgent
  userPrincipal: string
  handleNotify: (principal: string | undefined, base: string) => void
  handleWithdraw: (
    amount: number,
    account: string | undefined,
    token: TokenMetadata,
  ) => void
  handleDeposit: (
    amount: number,
    account: string | undefined,
    token: TokenMetadata,
  ) => void
  currentIndex: number | undefined
  onAccordionChange: (index: number | undefined) => void
}

const TokenRow: React.FC<TokenRowProps> = ({
  token,
  userAgent,
  userPrincipal,
  handleNotify,
  handleWithdraw,
  handleDeposit,
  currentIndex,
  onAccordionChange,
}) => {
  const claimTooltipTextStandard = (
    <>
      {`Claim Direct Deposit`}
      <br />
      {`Please wait...`}
    </>
  )

  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const bgColor = useColorModeValue('grey.200', 'grey.600')
  const bgColorMenu = useColorModeValue('grey.100', 'grey.900')
  const fontColor = useColorModeValue('grey.700', 'grey.25')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [action, setAction] = useState('')
  const [depositAllowance, setDepositAllowance] = useState<string | null>(null)
  const [maxDepositAllowance, setMaxDepositAllowance] = useState<string | null>(
    null,
  )
  const [claimTooltipText, setClaimTooltipText] = useState(
    claimTooltipTextStandard,
  )
  const { onCopy } = useClipboard(`${token.principal}`)
  const isMobile = useBreakpointValue({ base: true, md: false })

  const volumeInTotal = Number(token.volumeInTotal).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: token.decimals,
  })

  const volumeInLocked = Number(token.volumeInLocked).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: token.decimals,
  })

  const volumeInAvailable = Number(token.volumeInAvailable).toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: token.decimals,
    },
  )

  const toast = useToast({
    duration: 2000,
    position: 'top-right',
    isClosable: true,
  })

  const handleCopyToClipboard = () => {
    onCopy()
    toast({
      title: 'Copied',
      description: 'Token principal copied to clipboard',
      status: 'success',
    })
  }

  const isWithdrawConfirmationEnabled = (): boolean => {
    const storedValue = localStorage.getItem('withdrawalsDoubleConfirmation')
    return storedValue === 'true'
  }

  const initialValues = {
    amount: '',
    account: '',
    action: action,
    submit: false,
  }

  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required('Amount is a required field')
      .typeError('')
      .when('action', {
        is: 'withdraw',
        then: (schema) =>
          schema.max(token.volumeInAvailable || 0, 'Not enough funds'),
      })
      .when('action', {
        is: 'deposit',
        then: (schema) =>
          schema.max(Number(maxDepositAllowance) || 0, 'Not enough funds'),
      }),
    account: Yup.string().required('Account is a required field').typeError(''),
  })

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      if (Number(values.amount) > 0) {
        if (action === 'withdraw') {
          if (isWithdrawConfirmationEnabled()) onOpen()
          else handleWithdraw(Number(values.amount), values.account, token)
        } else if (action === 'deposit') {
          handleDeposit(Number(values.amount), values.account, token)
        }
      }
    },
  })

  const handleWithdrawConfirm = () => {
    onClose()
    handleWithdraw(Number(formik.values.amount), formik.values.account, token)
  }

  const getBalanceOf = useCallback(
    async (account: string | null = null) => {
      const { getBalance } = useWallet()
      const accountData = account ? account : userPrincipal
      const action = !account ? 'claim' : 'deposit'

      return await getBalance(
        userAgent,
        [token],
        `${token.principal}`,
        accountData,
        action,
      )
    },
    [userAgent, userPrincipal, token],
  )

  const handleTrackedDeposit = useCallback(async () => {
    setClaimTooltipText(claimTooltipTextStandard)

    const { getTrackedDeposit } = useWallet()

    const balanceOf = await getBalanceOf()

    const deposit = await getTrackedDeposit(
      userAgent,
      [token],
      `${token.principal}`,
    )

    if (
      typeof balanceOf !== 'number' ||
      typeof deposit !== 'number' ||
      isNaN(balanceOf) ||
      isNaN(deposit)
    ) {
      setClaimTooltipText(
        <>
          {`Claim Direct Deposit`}
          <br />
          {`Not Available`}
        </>,
      )
    } else if (balanceOf <= deposit) {
      setClaimTooltipText(
        <>
          {`Claim Direct Deposit`}
          <br />
          {`No deposits available`}
        </>,
      )
    } else {
      setClaimTooltipText(
        <>
          {`Claim Direct Deposit`}
          <br />
          {`${fixDecimal(balanceOf - deposit, token.decimals)} ${token.base} available`}
        </>,
      )
    }
  }, [getBalanceOf, userAgent, token])

  const handleAccordionToggle = (actionType: string) => {
    if (currentIndex === 0 && action === actionType) {
      onAccordionChange(undefined)
    } else if (currentIndex === undefined) {
      onAccordionChange(0)
      setAction(actionType)
    } else {
      setAction(actionType)
    }
  }

  const handleMaxAvailableClick = () => {
    if (action === 'withdraw')
      formik.setFieldValue('amount', token.volumeInAvailable)
  }

  const handleMaxDepositAllowance = useCallback(
    async (depositAllowanceAmount: string) => {
      if (formik.values.account && depositAllowanceAmount) {
        const balanceOf = await getBalanceOf(formik.values.account)

        const max =
          Math.min(Number(depositAllowanceAmount), Number(balanceOf)) -
          Number(token.fee)

        const amount = max > 0 ? fixDecimal(max, token.decimals) : '0'
        setMaxDepositAllowance(amount)
        return amount
      }
    },
    [getBalanceOf, token, formik.values.account],
  )

  const handleGetDepositAllowanceInfo = useCallback(async () => {
    setMaxDepositAllowance(null)

    if (formik.values.account) {
      const { getDepositAllowanceInfo } = useWallet()

      const result = await getDepositAllowanceInfo(
        userAgent,
        token.principal,
        formik.values.account,
      )

      if (result?.allowance !== undefined && result?.allowance !== null) {
        const { volumeInBase: allowanceResult } = convertVolumeFromCanister(
          Number(result.allowance),
          token.decimals,
          0,
        )
        const amount = fixDecimal(allowanceResult, token.decimals)
        setDepositAllowance(amount)
        handleMaxDepositAllowance(amount)
      } else setDepositAllowance(null)
    }
  }, [userAgent, token, formik.values.account, handleMaxDepositAllowance])

  useEffect(() => {
    if (action === 'deposit') {
      handleGetDepositAllowanceInfo()
    }
  }, [formik.values.account, action, handleGetDepositAllowanceInfo])

  useEffect(() => {
    formik.setFieldValue('action', action)
    formik.resetForm({ values: initialValues })
    setMaxDepositAllowance(null)
    setDepositAllowance(null)
  }, [action])

  useEffect(() => {
    if (token.withdrawStatus === 'success') {
      formik.setStatus({ success: true })
      formik.resetForm({ values: initialValues })
    } else if (token.withdrawStatus === 'error') {
      formik.setStatus({ success: false })
    }
  }, [token.withdrawStatus])

  return (
    <>
      <Accordion allowToggle index={currentIndex === 0 ? 0 : undefined}>
        <AccordionItem border="none">
          <>
            <AccordionButton display="none" />
            <Flex key={token.id} justify="space-between" align="center" py={2}>
              <Flex align="center">
                <Menu>
                  <Tooltip label={token.principal} aria-label="Token Principal">
                    <MenuButton
                      as={Flex}
                      align="center"
                      cursor="pointer"
                      onClick={handleCopyToClipboard}
                    >
                      <Flex align="center" cursor="pointer">
                        <Image
                          src={token.logo}
                          alt={token.symbol}
                          boxSize="30px"
                        />
                        <Text ml={2} fontSize="15px" fontWeight={600}>
                          {token.symbol}
                        </Text>
                      </Flex>
                    </MenuButton>
                  </Tooltip>
                  {isMobile && (
                    <MenuList bg={bgColorMenu} p={2}>
                      {token.principal}
                    </MenuList>
                  )}
                </Menu>
              </Flex>
              <Flex direction="column" align="flex-end" ml={2} overflowX="auto">
                <Flex align="center" overflowX="auto" whiteSpace="nowrap">
                  <Text mr={2}>{volumeInTotal}</Text>
                  <Tooltip label="Deposit by Allowance" aria-label="Allowance">
                    <IconButton
                      aria-label="Allowance"
                      icon={<RiHandCoinLine size="15px" />}
                      variant="ghost"
                      size="xs"
                      _hover={{
                        bg: bgColorHover,
                      }}
                      onClick={() => handleAccordionToggle('deposit')}
                    />
                  </Tooltip>
                  <Tooltip label={claimTooltipText} aria-label="Claim Deposit">
                    <IconButton
                      hidden //Individual claim, in the future it should be enabled
                      aria-label="Claim Deposit"
                      icon={
                        token?.notifyLoading ? (
                          <Spinner size="xs" />
                        ) : (
                          <LuDownload size="15px" />
                        )
                      }
                      onClick={() => {
                        handleNotify(token.principal, token.base)
                        setAction('claim')
                      }}
                      onMouseEnter={handleTrackedDeposit}
                      variant="ghost"
                      size="xs"
                      _hover={{
                        bg: bgColorHover,
                      }}
                    />
                  </Tooltip>
                  <Tooltip label="Withdraw" aria-label="Withdraw">
                    <IconButton
                      aria-label="Withdraw"
                      icon={<LuUpload size="15px" />}
                      variant="ghost"
                      size="xs"
                      _hover={{
                        bg: bgColorHover,
                      }}
                      onClick={() => handleAccordionToggle('withdraw')}
                    />
                  </Tooltip>
                </Flex>
                <Flex
                  direction="row"
                  justify="space-between"
                  align="center"
                  w="full"
                >
                  <Text fontSize="12px" color="grey.400">
                    {volumeInLocked} Locked
                  </Text>
                  <Text ml={2} fontSize="12px" color="grey.400">
                    {volumeInAvailable} Available
                  </Text>
                </Flex>
              </Flex>
            </Flex>

            <AccordionPanel pb={4}>
              <Flex direction="column" gap={4}>
                <Flex direction="column">
                  <FormControl variant="floating">
                    <Input
                      h="58px"
                      placeholder=" "
                      name="account"
                      sx={{ borderRadius: '5px' }}
                      isInvalid={
                        !!formik.errors.account && formik.touched.account
                      }
                      isDisabled={false}
                      value={formik.values.account}
                      onKeyUp={() => formik.validateField('account')}
                      onChange={(e) => {
                        formik.handleChange(e)
                      }}
                    />
                    <FormLabel color="grey.500" fontSize="15px">
                      {action === 'deposit'
                        ? 'Source account'
                        : 'Destination account'}
                    </FormLabel>
                    {depositAllowance && (
                      <Text color="grey.400" fontSize="12px">
                        Allowance amount: {depositAllowance} {token.base}
                      </Text>
                    )}
                    {!!formik.errors.account && formik.touched.account && (
                      <Text color="red.500" fontSize="12px">
                        {formik.errors.account}
                      </Text>
                    )}
                  </FormControl>
                </Flex>
                <Flex direction="column">
                  <InputGroup>
                    <FormControl variant="floating">
                      <Input
                        h="58px"
                        placeholder=" "
                        name="amount"
                        sx={{ borderRadius: '5px' }}
                        isInvalid={
                          !!formik.errors.amount && formik.touched.amount
                        }
                        isDisabled={false}
                        value={formik.values.amount}
                        onKeyUp={() => formik.validateField('amount')}
                        onChange={(e) => {
                          formik.handleChange(e)
                        }}
                      />
                      <FormLabel color="grey.500" fontSize="15px">
                        Amount
                      </FormLabel>
                    </FormControl>
                    <InputRightElement h="58px">
                      <Button
                        h="58px"
                        fontSize="11px"
                        borderRadius="0 5px 5px 0"
                        bgColor={'grey.500'}
                        color="grey.25"
                        _hover={{
                          bg: 'grey.400',
                          color: 'grey.25',
                        }}
                        onClick={async () => {
                          if (action === 'withdraw') {
                            handleMaxAvailableClick()
                          } else if (action === 'deposit' && depositAllowance) {
                            const amount =
                              await handleMaxDepositAllowance(depositAllowance)
                            formik.setFieldValue('amount', amount)
                          }
                        }}
                      >
                        Max
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {maxDepositAllowance && (
                    <Text color="grey.400" fontSize="12px">
                      Max available: {maxDepositAllowance} {token.base}
                    </Text>
                  )}
                  {!!formik.errors.amount && formik.touched.amount && (
                    <Text color="red.500" fontSize="12px">
                      {formik.errors.amount}
                    </Text>
                  )}
                </Flex>
                <Flex direction="column">
                  <Button
                    background={bgColor}
                    variant="solid"
                    h="58px"
                    color={fontColor}
                    _hover={{
                      bg: bgColorHover,
                      color: fontColor,
                    }}
                    isDisabled={
                      (action === 'withdraw' &&
                        token.withdrawStatus === 'loading') ||
                      (action === 'deposit' &&
                        token.depositStatus === 'loading')
                    }
                    onClick={() => formik.handleSubmit()}
                  >
                    {action === 'withdraw' ? (
                      token.withdrawStatus === 'loading' ? (
                        <>
                          Withdraw{' '}
                          <Spinner ml={2} size="sm" color={fontColor} />
                        </>
                      ) : (
                        'Withdraw'
                      )
                    ) : action === 'deposit' ? (
                      token.depositStatus === 'loading' ? (
                        <>
                          Deposit <Spinner ml={2} size="sm" color={fontColor} />
                        </>
                      ) : (
                        'Deposit'
                      )
                    ) : null}
                  </Button>
                </Flex>
              </Flex>
            </AccordionPanel>
          </>
        </AccordionItem>
      </Accordion>

      <WithdrawalsConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleWithdrawConfirm}
        title="Confirm Withdraw"
        description={
          <>
            <Text>
              Are you sure you want to withdraw{' '}
              <strong>
                {formik.values.amount} {token.base}
              </strong>{' '}
              to address
            </Text>
            <Text mt={3}>
              <strong>{formik.values.account}</strong>?
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

export default TokenRow
