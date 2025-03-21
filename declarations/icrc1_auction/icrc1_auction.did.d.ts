import type { ActorMethod } from '@dfinity/agent'
import type { IDL } from '@dfinity/candid'
import type { Principal } from '@dfinity/principal'

export interface Account {
  owner: Principal
  subaccount: [] | [Subaccount]
}
export interface AuctionQueryResponse {
  credits: Array<[Principal, CreditInfo]>
  asks: Array<[OrderId, Order]>
  bids: Array<[OrderId, Order]>
  session_numbers: Array<[Principal, bigint]>
  transaction_history: Array<TransactionHistoryItem>
  price_history: Array<PriceHistoryItem>
  points: bigint
  deposit_history: Array<DepositHistoryItem>
}
export interface AuctionQuerySelection {
  credits: [] | [boolean]
  asks: [] | [boolean]
  bids: [] | [boolean]
  session_numbers: [] | [boolean]
  transaction_history: [] | [[bigint, bigint]]
  price_history: [] | [[bigint, bigint, boolean]]
  deposit_history: [] | [[bigint, bigint]]
}
export type BtcNotifyResult =
  | {
      Ok: { credit_inc: bigint; credit: bigint; deposit_inc: bigint }
    }
  | {
      Err:
        | {
            GenericError: { error_message: string; error_code: bigint }
          }
        | { NotAvailable: { message: string } }
        | { TemporarilyUnavailable: string }
        | { AlreadyProcessing: null }
        | { NotMinted: null }
        | { CallLedgerError: { message: string } }
        | {
            NoNewUtxos: {
              suspended_utxos: [] | [Array<SuspendedUtxo>]
              required_confirmations: number
              pending_utxos: [] | [Array<PendingUtxo>]
              current_confirmations: [] | [number]
            }
          }
    }
export type BtcWithdrawResult =
  | { Ok: { block_index: bigint } }
  | {
      Err:
        | { MalformedAddress: string }
        | { GenericError: { error_code: any } }
        | { TemporarilyUnavailable: any }
        | { InsufficientAllowance: { allowance: bigint } }
        | { AlreadyProcessing: null }
        | { Duplicate: { duplicate_of: bigint } }
        | { InsufficientCredit: object }
        | { BadFee: { expected_fee: bigint } }
        | { AmountTooLow: bigint }
        | { AllowanceChanged: { current_allowance: bigint } }
        | { CreatedInFuture: { ledger_time: bigint } }
        | { TooOld: null }
        | { Expired: { ledger_time: bigint } }
        | { InsufficientFunds: { balance: any } }
    }
export type CancelOrderError =
  | { UnknownOrder: null }
  | { UnknownPrincipal: null }
  | { SessionNumberMismatch: Principal }
export type CancellationResult = [OrderId__1, Principal, bigint, number]
export interface CreditInfo {
  total: bigint
  locked: bigint
  available: bigint
}
export type DepositHistoryItem = [
  bigint,
  { deposit: null } | { withdrawal: null },
  Principal,
  bigint,
]
export type DepositResult =
  | {
      Ok: { credit_inc: bigint; txid: bigint; credit: bigint }
    }
  | {
      Err:
        | { TransferError: { message: string } }
        | { AmountBelowMinimum: object }
        | { CallLedgerError: { message: string } }
        | { BadFee: { expected_fee: bigint } }
    }
export type DirectCyclesWithdrawResult =
  | { Ok: { txid: bigint; amount: bigint } }
  | {
      Err:
        | {
            FailedToWithdraw: {
              rejection_code:
                | { NoError: null }
                | { CanisterError: null }
                | { SysTransient: null }
                | { DestinationInvalid: null }
                | { Unknown: null }
                | { SysFatal: null }
                | { CanisterReject: null }
              fee_block: [] | [bigint]
              rejection_reason: string
            }
          }
        | { GenericError: { message: string; error_code: bigint } }
        | { TemporarilyUnavailable: null }
        | { Duplicate: { duplicate_of: bigint } }
        | { InsufficientCredit: object }
        | { BadFee: { expected_fee: bigint } }
        | { InvalidReceiver: { receiver: Principal } }
        | { CreatedInFuture: { ledger_time: bigint } }
        | { TooLowAmount: object }
        | { TooOld: null }
        | { InsufficientFunds: { balance: bigint } }
    }
export interface HttpRequest {
  url: string
  method: string
  body: Uint8Array | number[]
  headers: Array<[string, string]>
}
export interface HttpResponse {
  body: Uint8Array | number[]
  headers: Array<[string, string]>
  status_code: number
}
export interface IndicativeStats {
  clearing:
    | { match: { volume: bigint; price: number } }
    | {
        noMatch: {
          minAskPrice: [] | [number]
          maxBidPrice: [] | [number]
        }
      }
  totalAskVolume: bigint
  totalBidVolume: bigint
}
export type InternalPlaceOrderError =
  | {
      ConflictingOrder: [{ ask: null } | { bid: null }, [] | [OrderId__1]]
    }
  | { UnknownAsset: null }
  | { NoCredit: null }
  | { VolumeStepViolated: { baseVolumeStep: bigint } }
  | { TooLowOrder: null }
  | { PriceDigitsOverflow: { maxDigits: bigint } }
export type LogEvent =
  | { depositInc: bigint }
  | {
      withdraw: {
        to: Account
        surcharge: bigint
        withdrawn: bigint
        amount: bigint
      }
    }
  | { surchargeUpdated: { new: bigint; old: bigint } }
  | { debited: bigint }
  | { locked: bigint }
  | { error: string }
  | {
      allowanceDrawn: {
        surcharge: bigint
        amount: bigint
        credited: bigint
      }
    }
  | {
      newDeposit: {
        depositInc: bigint
        surcharge: bigint
        creditInc: bigint
        ledgerFee: bigint
      }
    }
  | { feeUpdated: { new: bigint; old: bigint; delta: bigint } }
  | {
      consolidated: {
        fee: bigint
        deducted: bigint
        credited: bigint
      }
    }
  | { credited: bigint }
export type ManageOrdersError =
  | {
      placement: { error: InternalPlaceOrderError; index: bigint }
    }
  | { UnknownPrincipal: null }
  | { SessionNumberMismatch: Principal }
  | {
      cancellation: {
        error: { UnknownAsset: null } | { UnknownOrder: null }
        index: bigint
      }
    }
export type NotifyResult =
  | {
      Ok: { credit_inc: bigint; credit: bigint; deposit_inc: bigint }
    }
  | {
      Err:
        | { NotAvailable: { message: string } }
        | { CallLedgerError: { message: string } }
    }
export interface Order {
  icrc1Ledger: Principal
  volume: bigint
  price: number
}
export type OrderId = bigint
export type OrderId__1 = bigint
export interface PendingUtxo {
  confirmations: number
  value: bigint
  outpoint: { txid: Uint8Array | number[]; vout: number }
}
export type PlaceOrderError =
  | {
      ConflictingOrder: [{ ask: null } | { bid: null }, [] | [OrderId__1]]
    }
  | { UnknownAsset: null }
  | { NoCredit: null }
  | { UnknownPrincipal: null }
  | { VolumeStepViolated: { baseVolumeStep: bigint } }
  | { TooLowOrder: null }
  | { SessionNumberMismatch: Principal }
  | { PriceDigitsOverflow: { maxDigits: bigint } }
export type PriceHistoryItem = [bigint, bigint, Principal, bigint, number]
export type RegisterAssetError = { AlreadyRegistered: null }
export type ReimbursementReason =
  | { CallFailed: null }
  | { TaintedDestination: { kyt_fee: bigint; kyt_provider: Principal } }
export type ReplaceOrderError =
  | {
      ConflictingOrder: [{ ask: null } | { bid: null }, [] | [OrderId__1]]
    }
  | { UnknownAsset: null }
  | { UnknownOrder: null }
  | { NoCredit: null }
  | { UnknownPrincipal: null }
  | { VolumeStepViolated: { baseVolumeStep: bigint } }
  | { TooLowOrder: null }
  | { SessionNumberMismatch: Principal }
  | { PriceDigitsOverflow: { maxDigits: bigint } }
export type RetrieveBtcStatusV2 =
  | { Signing: null }
  | { Confirmed: { txid: Uint8Array | number[] } }
  | { Sending: { txid: Uint8Array | number[] } }
  | { AmountTooLow: null }
  | {
      WillReimburse: {
        account: {
          owner: Principal
          subaccount: [] | [Uint8Array | number[]]
        }
        amount: bigint
        reason: ReimbursementReason
      }
    }
  | { Unknown: null }
  | { Submitted: { txid: Uint8Array | number[] } }
  | {
      Reimbursed: {
        account: {
          owner: Principal
          subaccount: [] | [Uint8Array | number[]]
        }
        mint_block_index: bigint
        amount: bigint
        reason: ReimbursementReason
      }
    }
  | { Pending: null }
export type Subaccount = Uint8Array | number[]
export type SuspendedReason = { ValueTooSmall: null } | { Quarantined: null }
export interface SuspendedUtxo {
  utxo: Utxo
  earliest_retry: bigint
  reason: SuspendedReason
}
export interface TokenInfo {
  allowance_fee: bigint
  withdrawal_fee: bigint
  deposit_fee: bigint
}
export type TransactionHistoryItem = [
  bigint,
  bigint,
  { ask: null } | { bid: null },
  Principal,
  bigint,
  number,
]
export type UpperResult = { Ok: OrderId } | { Err: ReplaceOrderError }
export type UpperResult_1 = { Ok: bigint } | { Err: RegisterAssetError }
export type UpperResult_2 = { Ok: OrderId } | { Err: PlaceOrderError }
export type UpperResult_3 =
  | {
      Ok: [Array<CancellationResult>, Array<OrderId>]
    }
  | { Err: ManageOrdersError }
export type UpperResult_4 =
  | { Ok: CancellationResult }
  | { Err: CancelOrderError }
export interface UserOrder {
  user: Principal
  volume: bigint
  price: number
}
export interface Utxo {
  height: number
  value: bigint
  outpoint: { txid: Uint8Array | number[]; vout: number }
}
export type WithdrawResult =
  | { Ok: { txid: bigint; amount: bigint } }
  | {
      Err:
        | { AmountBelowMinimum: object }
        | { InsufficientCredit: object }
        | { CallLedgerError: { message: string } }
        | { BadFee: { expected_fee: bigint } }
    }
export interface _SERVICE {
  addAdmin: ActorMethod<[Principal], undefined>
  auction_query: ActorMethod<
    [Array<Principal>, AuctionQuerySelection],
    AuctionQueryResponse
  >
  btc_depositAddress: ActorMethod<[[] | [Principal]], string>
  btc_notify: ActorMethod<[], BtcNotifyResult>
  btc_withdraw: ActorMethod<[{ to: string; amount: bigint }], BtcWithdrawResult>
  btc_withdrawal_status: ActorMethod<
    [{ block_index: bigint }],
    RetrieveBtcStatusV2
  >
  cancelAsks: ActorMethod<[Array<OrderId>, [] | [bigint]], Array<UpperResult_4>>
  cancelBids: ActorMethod<[Array<OrderId>, [] | [bigint]], Array<UpperResult_4>>
  cycles_withdraw: ActorMethod<
    [{ to: Principal; amount: bigint }],
    DirectCyclesWithdrawResult
  >
  getQuoteLedger: ActorMethod<[], Principal>
  http_request: ActorMethod<[HttpRequest], HttpResponse>
  icrc84_deposit: ActorMethod<
    [
      {
        token: Principal
        from: {
          owner: Principal
          subaccount: [] | [Uint8Array | number[]]
        }
        amount: bigint
        expected_fee: [] | [bigint]
      },
    ],
    DepositResult
  >
  icrc84_notify: ActorMethod<[{ token: Principal }], NotifyResult>
  icrc84_query: ActorMethod<
    [Array<Principal>],
    Array<[Principal, { credit: bigint; tracked_deposit: [] | [bigint] }]>
  >
  icrc84_supported_tokens: ActorMethod<[], Array<Principal>>
  icrc84_token_info: ActorMethod<[Principal], TokenInfo>
  icrc84_withdraw: ActorMethod<
    [
      {
        to: {
          owner: Principal
          subaccount: [] | [Uint8Array | number[]]
        }
        token: Principal
        amount: bigint
        expected_fee: [] | [bigint]
      },
    ],
    WithdrawResult
  >
  indicativeStats: ActorMethod<[Principal], IndicativeStats>
  isTokenHandlerFrozen: ActorMethod<[Principal], boolean>
  listAdmins: ActorMethod<[], Array<Principal>>
  manageOrders: ActorMethod<
    [
      (
        | []
        | [
            | { all: [] | [Array<Principal>] }
            | { orders: Array<{ ask: OrderId } | { bid: OrderId }> },
          ]
      ),
      Array<
        | { ask: [Principal, bigint, number] }
        | { bid: [Principal, bigint, number] }
      >,
      [] | [bigint],
    ],
    UpperResult_3
  >
  nextSession: ActorMethod<[], { counter: bigint; timestamp: bigint }>
  placeAsks: ActorMethod<
    [Array<[Principal, bigint, number]>, [] | [bigint]],
    Array<UpperResult_2>
  >
  placeBids: ActorMethod<
    [Array<[Principal, bigint, number]>, [] | [bigint]],
    Array<UpperResult_2>
  >
  principalToSubaccount: ActorMethod<[Principal], [] | [Uint8Array | number[]]>
  queryAsks: ActorMethod<[], Array<[OrderId, Order, bigint]>>
  queryBids: ActorMethod<[], Array<[OrderId, Order, bigint]>>
  queryCredit: ActorMethod<[Principal], [CreditInfo, bigint]>
  queryCredits: ActorMethod<[], Array<[Principal, CreditInfo, bigint]>>
  queryDepositHistory: ActorMethod<
    [[] | [Principal], bigint, bigint],
    Array<DepositHistoryItem>
  >
  queryOrderBook: ActorMethod<
    [Principal],
    {
      asks: Array<[OrderId, UserOrder]>
      bids: Array<[OrderId, UserOrder]>
    }
  >
  queryPoints: ActorMethod<[], bigint>
  queryPriceHistory: ActorMethod<
    [[] | [Principal], bigint, bigint, boolean],
    Array<PriceHistoryItem>
  >
  queryTokenAsks: ActorMethod<[Principal], [Array<[OrderId, Order]>, bigint]>
  queryTokenBids: ActorMethod<[Principal], [Array<[OrderId, Order]>, bigint]>
  queryTokenHandlerJournal: ActorMethod<
    [Principal, bigint, bigint],
    Array<[Principal, LogEvent]>
  >
  queryTokenHandlerNotificationsOnPause: ActorMethod<[Principal], boolean>
  queryTokenHandlerState: ActorMethod<
    [Principal],
    {
      balance: {
        deposited: bigint
        underway: bigint
        usableDeposit: [bigint, boolean]
        queued: bigint
        consolidated: bigint
      }
      flow: { withdrawn: bigint; consolidated: bigint }
      feeManager: {
        surcharge: bigint
        deposit: bigint
        outstandingFees: bigint
        ledger: bigint
      }
      credit: { total: bigint; pool: bigint }
      users: { total: bigint; locked: bigint; queued: bigint }
      withdrawalManager: {
        lockedFunds: bigint
        totalWithdrawn: bigint
      }
      depositManager: {
        totalConsolidated: bigint
        funds: {
          deposited: bigint
          underway: bigint
          queued: bigint
        }
        totalCredited: bigint
        paused: boolean
      }
    }
  >
  queryTransactionHistory: ActorMethod<
    [[] | [Principal], bigint, bigint],
    Array<TransactionHistoryItem>
  >
  queryTransactionHistoryForward: ActorMethod<
    [[] | [Principal], bigint, bigint],
    [Array<TransactionHistoryItem>, bigint, boolean]
  >
  queryUserCreditsInTokenHandler: ActorMethod<[Principal, Principal], bigint>
  registerAsset: ActorMethod<[Principal, bigint], UpperResult_1>
  removeAdmin: ActorMethod<[Principal], undefined>
  replaceAsk: ActorMethod<[OrderId, bigint, number, [] | [bigint]], UpperResult>
  replaceBid: ActorMethod<[OrderId, bigint, number, [] | [bigint]], UpperResult>
  restartAuctionTimer: ActorMethod<[], undefined>
  setConsolidationTimerEnabled: ActorMethod<[boolean], undefined>
  settings: ActorMethod<
    [],
    {
      orderQuoteVolumeMinimum: bigint
      orderPriceDigitsLimit: bigint
      orderQuoteVolumeStep: bigint
    }
  >
  totalPointsSupply: ActorMethod<[], bigint>
  updateTokenHandlerFee: ActorMethod<[Principal], [] | [bigint]>
  user_auction_query: ActorMethod<
    [Principal, Array<Principal>, AuctionQuerySelection],
    AuctionQueryResponse
  >
  wipeOrders: ActorMethod<[], undefined>
  wipePriceHistory: ActorMethod<[Principal], undefined>
  wipeUsers: ActorMethod<[], undefined>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]
