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
import { FaWallet, FaBitcoin } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'

import ActionTab from './actions/actionTab'
import LedgerTab from './ledger/ledgerTab'
import TokenTab from './tokens/tokenTab'
import IcpMonoIcon from '../../../assets/img/coins/icp_mono.svg'
import WalletIconDark from '../../../assets/img/common/wallet-black.svg'
import WalletIconLight from '../../../assets/img/common/wallet-white.svg'
import useWallet from '../../../hooks/useWallet'
import { RootState, AppDispatch } from '../../../store'
import { setUserPoints } from '../../../store/auth'
import { setBalances, setIsWithdrawStarted } from '../../../store/balances'
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
import {
  getSimpleToastDescription,
  getDoubleLineToastDescription,
} from '../../../utils/uiUtils'
import { formatWalletAddress } from '../../../utils/walletUtils'
import {
  getErrorMessageNotifyDeposits,
  getErrorMessageWithdraw,
  getErrorMessageDeposit,
  getErrorMessageBtcWithdraw,
  getMemPoolUtxos,
} from '../../../utils/walletUtils'

const WalletContent: React.FC = () => {
  const bgColorHover = useColorModeValue('grey.300', 'grey.500')
  const borderColor = useColorModeValue('grey.700', 'grey.25')
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
  const userBtcDeposit = useSelector(
    (state: RootState) => state.auth.userBtcDepositAddress,
  )
  const userIcpLegacyAccount = useSelector(
    (state: RootState) => state.auth.userIcpLegacyAccount,
  )

  const userDeposit = useSelector((state: RootState) => state.auth.userDeposit)
  const balances = useSelector((state: RootState) => state.balances.balances)
  const tokens = useSelector((state: RootState) => state.tokens.tokens)

  const userDepositAddress = formatWalletAddress(userDeposit)
  const userBtcDepositAddress = formatWalletAddress(userBtcDeposit)
  const userIcpLegacyAccountAddress = formatWalletAddress(userIcpLegacyAccount)

  const { onCopy: onCopyUserDeposit } = useClipboard(userDeposit)
  const { onCopy: onCopyBtcAddress } = useClipboard(userBtcDeposit)
  const { onCopy: onCopyIcpLegacyAddress } = useClipboard(userIcpLegacyAccount)

  const userDepositTooltip = (
    <>
      {`ICRC-1 Tokens. Transfer here or set as allowance spender:`}
      <br />
      {userDeposit}
    </>
  )

  const userBtcDepositAddressTooltip = (
    <>
      {`Bitcoin. Transfer here:`}
      <br />
      {userBtcDeposit}
    </>
  )

  const userIcpLegacyAccountAddressTooltip = (
    <>
      {`ICP Legacy. Transfer here:`}
      <br />
      {userIcpLegacyAccount}
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
    onCopyUserDeposit()
    toast({
      title: 'Copied',
      description: 'Wallet account copied to clipboard',
      status: 'success',
      duration: 2000,
    })
  }

  const copyToClipboardBtcDepositAddress = () => {
    onCopyBtcAddress()
    toast({
      title: 'Copied',
      description: 'BTC account address copied to clipboard',
      status: 'success',
      duration: 2000,
    })
  }

  const copyToClipboardIcpLegacyAccountAddress = () => {
    onCopyIcpLegacyAddress()
    toast({
      title: 'Copied',
      description: 'ICP Legacy account address copied to clipboard',
      status: 'success',
      duration: 2000,
    })
  }

  const handleAllTrackedDeposits = useCallback(async () => {
    setClaimTooltipText(claimTooltipTextStandard)

    const { getTrackedDeposit, getBalance } = useWallet()

    const trackedDeposit = await getTrackedDeposit(userAgent, tokens, '')

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

        const tokenDeposit =
          trackedDeposit.find(
            (item: { token: { base: string } }) =>
              item.token.base === token.base,
          ) || null

        const deposit = tokenDeposit ? tokenDeposit.volumeInBase : 0

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

    const ckBtcUtxo = JSON.parse(
      localStorage.getItem('ckBtcUtxo') || '[]',
      (key, value) =>
        typeof value === 'string' && /^\d+$/.test(value)
          ? BigInt(value)
          : value,
    )

    const newBtcUtxo = await getMemPoolUtxos(userBtcDeposit, ckBtcUtxo, tokens)
    console.log('newBtcUtxo list: ', newBtcUtxo)
    if (filteredClaims.length > 0 || newBtcUtxo.length > 0) {
      setClaimTooltipText(
        <>
          {filteredClaims.length > 0 ? (
            <>
              {`Claim Direct Deposits:`}
              <br />
              {filteredClaims.map((claim, index) => (
                <div key={index}>{claim}</div>
              ))}
            </>
          ) : (
            <>
              {`Claim Direct Deposits:`}
              <br />
              {`No direct deposits available`}
            </>
          )}

          {newBtcUtxo.length > 0 && (
            <>
              <div
                style={{
                  width: '100%',
                  borderBottom: '1px solid',
                  margin: '8px 0',
                  textAlign: 'center',
                  borderColor: `${borderColor}`,
                }}
              ></div>
              {`Pending:`}
              <br />
              {newBtcUtxo.map((utxo, index) => (
                <span key={index}>
                  <a
                    href={`https://mempool.space/tx/${utxo.txid}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      all: 'unset',
                      cursor: 'pointer',
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      pointerEvents: 'all',
                    }}
                  >
                    {`${utxo.amount} BTC (${utxo.confirmations}/6)`}
                  </a>
                </span>
              ))}
            </>
          )}
        </>,
      )
    } else {
      setClaimTooltipText(
        <>
          {`Claim Direct Deposits:`}
          <br />
          {`No deposits available`}
        </>,
      )
    }
  }, [
    balances,
    userAgent,
    userPrincipal,
    userBtcDeposit,
    tokens,
    getMemPoolUtxos,
  ])

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
      const startTime = Date.now()
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
          const endTime = Date.now()
          const durationInSeconds = (endTime - startTime) / 1000

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
                description: getSimpleToastDescription(
                  `Credited: ${fixDecimal(creditInc, token?.decimals)} | Total: ${fixDecimal(creditTotal, token?.decimals)}`,
                  durationInSeconds,
                ),
                status: 'success',
                isClosable: true,
              })
            }
          } else {
            if (toastId) {
              toast.update(toastId, {
                title: `No new ${base} deposits found`,
                description: getSimpleToastDescription(
                  getErrorMessageNotifyDeposits(response.Err),
                  durationInSeconds,
                ),
                status: 'warning',
                isClosable: true,
              })
            }
          }
          loadingNotify(base, false)
        })
        .catch((error) => {
          const message = error.response ? error.response.data : error.message

          const endTime = Date.now()
          const durationInSeconds = (endTime - startTime) / 1000

          if (toastId) {
            toast.update(toastId, {
              title: 'Notify deposit rejected',
              description: getSimpleToastDescription(
                `Error: ${message}`,
                durationInSeconds,
              ),
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
    (
      amount: number,
      account: string | undefined,
      token: TokenMetadata,
      network: string | null,
    ) => {
      const startTime = Date.now()

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

      if (network === 'bitcoin') {
        const { btcWithdrawCredit } = useWallet()
        btcWithdrawCredit(userAgent, `${account}`, Number(volume))
          .then((response: Result | null) => {
            const endTime = Date.now()
            const durationInSeconds = (endTime - startTime) / 1000

            if (response && Object.keys(response).includes('Ok')) {
              fetchBalances()
              withdrawStatus(token.base, 'success')

              console.log('btcWithdrawCreditResponse', response)

              const blockIndexStorage = JSON.parse(
                localStorage.getItem('blockIndex') || '[]',
                (key, value) =>
                  typeof value === 'string' && /^\d+$/.test(value)
                    ? BigInt(value)
                    : value,
              )

              const newBlockIndex = BigInt(response.Ok?.block_index)

              if (
                !Array.isArray(blockIndexStorage) ||
                blockIndexStorage.length === 0
              ) {
                localStorage.setItem(
                  'blockIndex',
                  JSON.stringify([newBlockIndex], (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value,
                  ),
                )
              } else {
                blockIndexStorage.push(newBlockIndex)

                localStorage.setItem(
                  'blockIndex',
                  JSON.stringify(blockIndexStorage, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value,
                  ),
                )
              }

              dispatch(setIsWithdrawStarted())

              if (toastId) {
                toast.update(toastId, {
                  title: `Withdraw Native ${token.base} Started`,
                  description: getDoubleLineToastDescription(
                    `Amount: ${fixDecimal(amount, token.decimals)} | Txid: ${response.Ok?.block_index}`,
                    `To: ${account}`,
                    durationInSeconds,
                  ),
                  status: 'success',
                  isClosable: true,
                })
              }
            } else if (response && Object.keys(response).includes('Err')) {
              withdrawStatus(token.base, 'error')
              if (toastId) {
                toast.update(toastId, {
                  title: `Withdraw Native ${token.base} rejected`,
                  description: getSimpleToastDescription(
                    getErrorMessageBtcWithdraw(response.Err),
                    durationInSeconds,
                  ),
                  status: 'error',
                  isClosable: true,
                })
              }
            } else {
              withdrawStatus(token.base, 'error')
              if (toastId) {
                toast.update(toastId, {
                  title: `Withdraw Native ${token.base} rejected`,
                  description: getSimpleToastDescription(
                    'Something went wrong',
                    durationInSeconds,
                  ),
                  status: 'error',
                  isClosable: true,
                })
              }
            }
          })
          .catch((error) => {
            const message = error.response ? error.response.data : error.message
            const endTime = Date.now()
            const durationInSeconds = (endTime - startTime) / 1000

            withdrawStatus(token.base, 'error')
            if (toastId) {
              toast.update(toastId, {
                title: 'Withdraw Native BTC rejected',
                description: getSimpleToastDescription(
                  `Error: ${message}`,
                  durationInSeconds,
                ),
                status: 'error',
                isClosable: true,
              })
            }
            console.error('Withdraw failed:', message)
          })
      } else {
        const { withdrawCredit } = useWallet()
        withdrawCredit(userAgent, `${token.principal}`, account, Number(volume))
          .then((response: Result | null) => {
            const endTime = Date.now()
            const durationInSeconds = (endTime - startTime) / 1000

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
                  description: getSimpleToastDescription(
                    `Amount: ${fixDecimal(volumeInBase, token.decimals)} | Txid: ${response.Ok?.txid}`,
                    durationInSeconds,
                  ),
                  status: 'success',
                  isClosable: true,
                })
              }
            } else if (response && Object.keys(response).includes('Err')) {
              withdrawStatus(token.base, 'error')
              if (toastId) {
                toast.update(toastId, {
                  title: `Withdraw ${token.base} rejected`,
                  description: getSimpleToastDescription(
                    getErrorMessageWithdraw(response.Err),
                    durationInSeconds,
                  ),
                  status: 'error',
                  isClosable: true,
                })
              }
            } else {
              withdrawStatus(token.base, 'error')
              if (toastId) {
                toast.update(toastId, {
                  title: `Withdraw ${token.base} rejected`,
                  description: getSimpleToastDescription(
                    'Something went wrong',
                    durationInSeconds,
                  ),
                  status: 'error',
                  isClosable: true,
                })
              }
            }
          })
          .catch((error) => {
            const message = error.response ? error.response.data : error.message
            const endTime = Date.now()
            const durationInSeconds = (endTime - startTime) / 1000

            withdrawStatus(token.base, 'error')
            if (toastId) {
              toast.update(toastId, {
                title: 'Withdraw rejected',
                description: getSimpleToastDescription(
                  `Error: ${message}`,
                  durationInSeconds,
                ),
                status: 'error',
                isClosable: true,
              })
            }
            console.error('Withdraw failed:', message)
          })
      }
    },
    [fetchBalances, toast, userAgent],
  )

  const handleDeposit = useCallback(
    (amount: number, account: string | undefined, token: TokenMetadata) => {
      const startTime = Date.now()

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
          const endTime = Date.now()
          const durationInSeconds = (endTime - startTime) / 1000

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
                description: getSimpleToastDescription(
                  `Amount: ${fixDecimal(creditInc, token.decimals)} | Total: ${fixDecimal(creditTotal, token.decimals)}`,
                  durationInSeconds,
                ),
                status: 'success',
                isClosable: true,
              })
            }
          } else if (response && Object.keys(response).includes('Err')) {
            depositStatus(token.base, 'error')
            if (toastId) {
              toast.update(toastId, {
                title: `Deposit ${token.base} rejected`,
                description: getSimpleToastDescription(
                  getErrorMessageDeposit(response.Err),
                  durationInSeconds,
                ),
                status: 'error',
                isClosable: true,
              })
            }
          } else {
            depositStatus(token.base, 'error')
            if (toastId) {
              toast.update(toastId, {
                title: `Deposit ${token.base} rejected`,
                description: getSimpleToastDescription(
                  'Something went wrong',
                  durationInSeconds,
                ),
                status: 'error',
                isClosable: true,
              })
            }
          }
        })
        .catch((error) => {
          const message = error.response ? error.response.data : error.message
          const endTime = Date.now()
          const durationInSeconds = (endTime - startTime) / 1000

          depositStatus(token.base, 'error')
          if (toastId) {
            toast.update(toastId, {
              title: 'Deposit rejected',
              description: getSimpleToastDescription(
                `Error: ${message}`,
                durationInSeconds,
              ),
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
          <Tooltip
            label={claimTooltipText}
            aria-label="Claim Deposit"
            closeDelay={5000}
          >
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
      <Flex align="center" justifyContent="space-between">
        <Flex align="center">
          <Icon as={FaBitcoin} boxSize={4} mr={2} />
          <Tooltip
            label={userBtcDepositAddressTooltip}
            aria-label={userBtcDeposit}
          >
            <Text
              onClick={copyToClipboardBtcDepositAddress}
              cursor="pointer"
              p={1}
              border="1px solid transparent"
              borderRadius="md"
              _hover={{
                borderColor: bgColorHover,
                borderRadius: 'md',
              }}
            >
              {userBtcDepositAddress}
            </Text>
          </Tooltip>
        </Flex>
      </Flex>
      <Flex align="center" justifyContent="space-between">
        <Flex align="center">
          <Image src={IcpMonoIcon} alt="ICP" boxSize="16px" mr={2} />
          <Tooltip
            label={userIcpLegacyAccountAddressTooltip}
            aria-label={userIcpLegacyAccount}
          >
            <Text
              onClick={copyToClipboardIcpLegacyAccountAddress}
              cursor="pointer"
              p={1}
              border="1px solid transparent"
              borderRadius="md"
              _hover={{
                borderColor: bgColorHover,
                borderRadius: 'md',
              }}
            >
              {userIcpLegacyAccountAddress}
            </Text>
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
