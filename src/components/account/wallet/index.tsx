import React, { useState, useEffect, useCallback } from 'react'

import {
  Flex,
  Button,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast,
  useColorModeValue,
  useColorMode,
  Tooltip,
  Image,
  useClipboard,
} from '@chakra-ui/react'
import { Principal } from '@dfinity/principal'
import { FaWallet } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'

import ActionTab from './actions/actionTab'
import LedgerTab from './ledger/ledgerTab'
import TokenTab from './tokens/tokenTab'
import WalletIconDark from '../../../assets/img/common/wallet-black.svg'
import WalletIconLight from '../../../assets/img/common/wallet-white.svg'
import useWallet from '../../../hooks/useWallet'
import { RootState, AppDispatch } from '../../../store'
import { setUserPoints } from '../../../store/auth'
import { setBalances } from '../../../store/balances'
import {
  Result,
  TokenDataItem,
  TokenMetadata,
  ClaimTokenBalance,
} from '../../../types'
import {
  convertVolumeFromCanister,
  convertVolumetoCanister,
  getDecimals,
  fixDecimal,
} from '../../../utils/calculationsUtils'
import { getToken } from '../../../utils/tokenUtils'
import { formatWalletAddress } from '../../../utils/walletUtils'
import {
  getErrorMessageNotifyDeposits,
  getErrorMessageWithdraw,
  getErrorMessageDeposit,
} from '../../../utils/walletUtils'

const WalletContent: React.FC = () => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const { colorMode } = useColorMode()
  const toast = useToast({
    duration: 10000,
    position: 'top-right',
    isClosable: true,
  })
  const dispatch = useDispatch<AppDispatch>()
  const [selectedTab, setSelectedTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [localBalances, setLocalBalances] = useState<TokenDataItem[]>([])
  const [claimTokensBalance, setClaimTokensBalance] = useState<
    ClaimTokenBalance[]
  >([])
  const { userAgent } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )
  const userPrincipal = useSelector(
    (state: RootState) => state.auth.userPrincipal,
  )
  const userDeposit = useSelector((state: RootState) => state.auth.userDeposit)
  const balances = useSelector((state: RootState) => state.balances.balances)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)

  const userDepositAddress = formatWalletAddress(userDeposit)
  const { onCopy } = useClipboard(userDeposit)

  const userDepositTooltip = (
    <>
      {`Wallet account. Transfer here or set as allowance spender:`}
      <br />
      {userDeposit}
    </>
  )

  const claimTooltipTextStandard = (
    <>
      {`Claim Direct Deposit`}
      <br />
      {`Please wait...`}
    </>
  )
  const [claimTooltipText, setClaimTooltipText] = useState(
    claimTooltipTextStandard,
  )

  const fetchBalances = useCallback(async () => {
    setLoading(true)
    const { getBalancesCredits, getUserPoints } = useWallet()

    const [balancesCredits, points] = await Promise.all([
      getBalancesCredits(userAgent, tokens),
      getUserPoints(userAgent),
    ])

    dispatch(setBalances(balancesCredits))
    dispatch(setUserPoints(Number(points)))

    setLoading(false)
  }, [userAgent, tokens, dispatch])

  const copyToClipboardDepositAddress = () => {
    onCopy()
    toast({
      title: 'Copied',
      description: 'Wallet account copied to clipboard',
      status: 'success',
      duration: 2000,
    })
  }

  const handleAllTrackedDeposits = useCallback(async () => {
    setClaimTooltipText(claimTooltipTextStandard)

    const { getTrackedDeposit, getBalance } = useWallet()

    const tokensBalance: ClaimTokenBalance[] = []
    const claims = await Promise.all(
      balances.map(async (token) => {
        const balanceOf = await getBalance(
          userAgent,
          [token],
          `${token.principal}`,
          userPrincipal,
          'claim',
        )

        const deposit = await getTrackedDeposit(
          userAgent,
          [token],
          `${token.principal}`,
        )

        if (
          typeof balanceOf === 'number' &&
          typeof deposit === 'number' &&
          !isNaN(balanceOf) &&
          !isNaN(deposit)
        ) {
          const available = balanceOf - deposit
          if (available > 0) {
            tokensBalance.push({
              principal: `${token?.principal}`,
              base: token?.base,
              available,
            })
            return `${fixDecimal(available, token.decimals)} ${token.base} available`
          }
        }
        return null
      }),
    )

    setClaimTokensBalance(tokensBalance)
    const filteredClaims = claims.filter((claim) => claim !== null)

    if (filteredClaims.length > 0) {
      setClaimTooltipText(
        <>
          {`Claim Direct Deposits`}
          <br />
          {filteredClaims.map((claim, index) => (
            <div key={index}>{claim}</div>
          ))}
        </>,
      )
    } else {
      setClaimTooltipText(
        <>
          {`Claim Direct Deposits`}
          <br />
          {`No deposits available`}
        </>,
      )
    }
  }, [balances, userAgent, userPrincipal])

  const handleMultipleTokenClaims = useCallback(() => {
    claimTokensBalance.map((token) => {
      const tokenInfo = getToken(tokens, Principal.fromText(token.principal))

      if (token.available < Number(tokenInfo.fee)) {
        toast({
          title: `The amount ${token.base} detected is below the minimum`,
          description: '',
          status: 'warning',
          isClosable: true,
        })
      } else {
        handleNotify(token.principal, token.base)
      }
    })
  }, [claimTokensBalance])

  const handleNotify = useCallback(
    (principal: string | undefined, base: string) => {
      const { balanceNotify } = useWallet()

      const loadingNotify = (base: string, notifyLoading: boolean) => {
        setLocalBalances((prevBalances) =>
          prevBalances.map((balance: TokenDataItem) =>
            balance.base === base ? { ...balance, notifyLoading } : balance,
          ),
        )
      }
      loadingNotify(base, true)

      const toastId = toast({
        title: `Checking new ${base} deposits`,
        description: 'Please wait',
        status: 'loading',
        duration: null,
        isClosable: true,
      })

      balanceNotify(userAgent, principal)
        .then(async (response: Result) => {
          if (Object.keys(response).includes('Ok')) {
            await fetchBalances()
            const token = balances.find((balance) => balance.base === base)

            const creditTotalRaw = response.Ok?.credit
            const depositIncRaw = response.Ok?.deposit_inc
            const creditIncRaw = response.Ok?.credit_inc

            const { volumeInBase: creditTotal } = convertVolumeFromCanister(
              Number(creditTotalRaw),
              getDecimals(token),
              0,
            )

            const { volumeInBase: depositInc } = convertVolumeFromCanister(
              Number(depositIncRaw),
              getDecimals(token),
              0,
            )

            const { volumeInBase: creditInc } = convertVolumeFromCanister(
              Number(creditIncRaw),
              getDecimals(token),
              0,
            )

            if (toastId) {
              toast.update(toastId, {
                title: `New ${base} deposits found: ${fixDecimal(depositInc, token?.decimals)}`,
                description: `Credited: ${fixDecimal(creditInc, token?.decimals)} | Total: ${fixDecimal(creditTotal, token?.decimals)}`,
                status: 'success',
                isClosable: true,
              })
            }
          } else {
            if (toastId) {
              const description = getErrorMessageNotifyDeposits(response.Err)
              toast.update(toastId, {
                title: `No new ${base} deposits found`,
                description,
                status: 'warning',
                isClosable: true,
              })
            }
          }
          loadingNotify(base, false)
        })
        .catch((error) => {
          const message = error.response ? error.response.data : error.message

          if (toastId) {
            toast.update(toastId, {
              title: 'Notify deposit rejected',
              description: `Error: ${message}`,
              status: 'error',
              isClosable: true,
            })
          }
          loadingNotify(base, false)
          console.error('Cancellation failed:', message)
        })
    },
    [balances, fetchBalances, toast, userAgent],
  )

  const handleWithdraw = useCallback(
    (amount: number, account: string | undefined, token: TokenMetadata) => {
      const withdrawStatus = (base: string, withdrawStatus: string) => {
        setLocalBalances((prevBalances) =>
          prevBalances.map((balance: TokenDataItem) =>
            balance.base === base ? { ...balance, withdrawStatus } : balance,
          ),
        )
      }
      withdrawStatus(token.base, 'loading')

      const volume = convertVolumetoCanister(
        Number(amount),
        Number(token.decimals),
      )

      const toastId = toast({
        title: `Withdraw ${token.base} pending`,
        description: 'Please wait',
        status: 'loading',
        duration: null,
        isClosable: true,
      })

      const { withdrawCredit } = useWallet()
      withdrawCredit(userAgent, `${token.principal}`, account, Number(volume))
        .then((response: Result | null) => {
          if (response && Object.keys(response).includes('Ok')) {
            fetchBalances()
            withdrawStatus(token.base, 'success')

            const { volumeInBase } = convertVolumeFromCanister(
              Number(response.Ok?.amount),
              Number(token.decimals),
              0,
            )

            if (toastId) {
              toast.update(toastId, {
                title: `Withdraw ${token.base} Success`,
                description: `Amount: ${fixDecimal(volumeInBase, token.decimals)} | Txid: ${response.Ok?.txid}`,
                status: 'success',
                isClosable: true,
              })
            }
          } else if (response && Object.keys(response).includes('Err')) {
            withdrawStatus(token.base, 'error')
            if (toastId) {
              const description = getErrorMessageWithdraw(response.Err)
              toast.update(toastId, {
                title: `Withdraw ${token.base} rejected`,
                description,
                status: 'error',
                isClosable: true,
              })
            }
          } else {
            withdrawStatus(token.base, 'error')
            if (toastId) {
              toast.update(toastId, {
                title: `Withdraw ${token.base} rejected`,
                description: 'Something went wrong',
                status: 'error',
                isClosable: true,
              })
            }
          }
        })
        .catch((error) => {
          const message = error.response ? error.response.data : error.message
          withdrawStatus(token.base, 'error')
          if (toastId) {
            toast.update(toastId, {
              title: 'Withdraw rejected',
              description: `Error: ${message}`,
              status: 'error',
              isClosable: true,
            })
          }
          console.error('Withdraw failed:', message)
        })
    },
    [fetchBalances, toast, userAgent],
  )

  const handleDeposit = useCallback(
    (amount: number, account: string | undefined, token: TokenMetadata) => {
      const depositStatus = (base: string, depositStatus: string) => {
        setLocalBalances((prevBalances) =>
          prevBalances.map((balance: TokenDataItem) =>
            balance.base === base ? { ...balance, depositStatus } : balance,
          ),
        )
      }
      depositStatus(token.base, 'loading')

      const volume = convertVolumetoCanister(
        Number(amount),
        Number(token.decimals),
      )

      const toastId = toast({
        title: `Deposit ${token.base} pending`,
        description: 'Please wait',
        status: 'loading',
        duration: null,
        isClosable: true,
      })

      const { deposit } = useWallet()
      deposit(userAgent, `${token.principal}`, account, Number(volume))
        .then((response: Result | null) => {
          if (response && Object.keys(response).includes('Ok')) {
            fetchBalances()
            depositStatus(token.base, 'success')

            const creditTotalRaw = response.Ok?.credit
            const creditIncRaw = response.Ok?.credit_inc

            const { volumeInBase: creditTotal } = convertVolumeFromCanister(
              Number(creditTotalRaw),
              getDecimals(token),
              0,
            )

            const { volumeInBase: creditInc } = convertVolumeFromCanister(
              Number(creditIncRaw),
              getDecimals(token),
              0,
            )

            if (toastId) {
              toast.update(toastId, {
                title: `Deposit ${token.base} Success | Txid: ${response.Ok?.txid}`,
                description: `Amount: ${fixDecimal(creditInc, token.decimals)} | Total: ${fixDecimal(creditTotal, token.decimals)}`,
                status: 'success',
                isClosable: true,
              })
            }
          } else if (response && Object.keys(response).includes('Err')) {
            depositStatus(token.base, 'error')
            if (toastId) {
              const description = getErrorMessageDeposit(response.Err)
              toast.update(toastId, {
                title: `Deposit ${token.base} rejected`,
                description,
                status: 'error',
                isClosable: true,
              })
            }
          } else {
            depositStatus(token.base, 'error')
            if (toastId) {
              toast.update(toastId, {
                title: `Deposit ${token.base} rejected`,
                description: 'Something went wrong',
                status: 'error',
                isClosable: true,
              })
            }
          }
        })
        .catch((error) => {
          const message = error.response ? error.response.data : error.message
          depositStatus(token.base, 'error')
          if (toastId) {
            toast.update(toastId, {
              title: 'Deposit rejected',
              description: `Error: ${message}`,
              status: 'error',
              isClosable: true,
            })
          }
          console.error('Deposit failed:', message)
        })
    },
    [fetchBalances, toast, userAgent],
  )

  useEffect(() => {
    if (isAuthenticated) fetchBalances()
  }, [userAgent, tokens])

  useEffect(() => {
    setLocalBalances(balances)
  }, [balances])

  return (
    <VStack spacing={1} align="stretch">
      <Flex align="center" justifyContent="space-between">
        <Flex align="center">
          <Icon as={FaWallet} boxSize={4} mr={2} />
          <Tooltip label={userDepositTooltip} aria-label={userDeposit}>
            <Text
              onClick={copyToClipboardDepositAddress}
              cursor="pointer"
              p={1}
              border="1px solid transparent"
              borderRadius="md"
              _hover={{
                borderColor: bgColorHover,
                borderRadius: 'md',
              }}
            >
              {userDepositAddress}
            </Text>
          </Tooltip>
        </Flex>
        <Flex align="center">
          <Tooltip label={claimTooltipText} aria-label="Claim Deposit">
            <Button
              onClick={handleMultipleTokenClaims}
              onMouseEnter={handleAllTrackedDeposits}
              variant="unstyled"
              p={0}
              m={0}
              display="flex"
              alignItems="center"
            >
              <Image
                src={colorMode === 'dark' ? WalletIconLight : WalletIconDark}
                boxSize={4}
                mr={2}
              />
              <Text>Claim Deposit</Text>
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
      <Tabs
        index={selectedTab}
        onChange={(index) => setSelectedTab(index)}
        borderColor="transparent"
      >
        <TabList>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ background: 'transparent' }}
          >
            My Tokens
          </Tab>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ background: 'transparent' }}
          >
            Tokens
          </Tab>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ background: 'transparent' }}
          >
            Transfers
          </Tab>
          <Tab
            _selected={{ borderBottom: '2px solid', borderColor: 'blue.500' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ background: 'transparent' }}
          >
            Reports
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TokenTab
              balances={localBalances.filter(
                (token) => token?.volumeInTotal && token.volumeInTotal > 0,
              )}
              userAgent={userAgent}
              userPrincipal={userPrincipal}
              handleNotify={handleNotify}
              handleWithdraw={handleWithdraw}
              handleDeposit={handleDeposit}
              showSearch={true}
              loading={loading}
            />
          </TabPanel>
          <TabPanel>
            <TokenTab
              balances={localBalances}
              userAgent={userAgent}
              userPrincipal={userPrincipal}
              handleNotify={handleNotify}
              handleWithdraw={handleWithdraw}
              handleDeposit={handleDeposit}
              showSearch={true}
              loading={loading}
            />
          </TabPanel>
          <TabPanel>
            <ActionTab userAgent={userAgent} tokens={tokens} />
          </TabPanel>
          <TabPanel>
            <LedgerTab tokens={tokens} />
          </TabPanel>
          <TabPanel>
            <ActionTab userAgent={userAgent} tokens={tokens} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}

export default WalletContent
