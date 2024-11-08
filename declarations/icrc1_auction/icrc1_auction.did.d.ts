import type { ActorMethod } from '@dfinity/agent'
import type { IDL } from '@dfinity/candid'
import type { Principal } from '@dfinity/principal'

export interface Account {
  owner: Principal
  subaccount: [] | [Subaccount]
}
export type CancelOrderError =
  | { UnknownOrder: null }
  | { UnknownPrincipal: null }
  | { SessionNumberMismatch: Principal }
export interface CreditInfo {
  total: bigint
  locked: bigint
  available: bigint
}
export type DepositFromAllowance =
  | {
      GenericError: { message: string; error_code: bigint }
    }
  | { TemporarilyUnavailable: null }
  | { InsufficientAllowance: { allowance: bigint } }
  | { BadBurn: { min_burn_amount: bigint } }
  | { Duplicate: { duplicate_of: bigint } }
  | { BadFee: { expected_fee: bigint } }
  | { CreatedInFuture: { ledger_time: bigint } }
  | { CallIcrc1LedgerError: null }
  | { InsufficientFunds: { balance: bigint } }
export type DepositHistoryItem = [
  bigint,
  { deposit: null } | { withdrawal: null } | { withdrawalRollback: null },
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
  | { withdraw: { to: Account; amount: bigint } }
  | { allowanceError: DepositFromAllowance }
  | { surchargeUpdated: { new: bigint; old: bigint } }
  | { debited: bigint }
  | { error: string }
  | { consolidationError: TransferMin }
  | { issued: bigint }
  | { allowanceDrawn: { amount: bigint } }
  | { newDeposit: bigint }
  | { feeUpdated: { new: bigint; old: bigint } }
  | { consolidated: { deducted: bigint; credited: bigint } }
  | { burned: bigint }
  | { withdrawalError: Withdraw }
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
export type RegisterAssetError = { AlreadyRegistered: bigint }
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
export type Subaccount = Uint8Array | number[]
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
export type TransferMin =
  | {
      GenericError: { message: string; error_code: bigint }
    }
  | { TemporarilyUnavailable: null }
  | { BadBurn: { min_burn_amount: bigint } }
  | { Duplicate: { duplicate_of: bigint } }
  | { BadFee: { expected_fee: bigint } }
  | { CreatedInFuture: { ledger_time: bigint } }
  | { TooOld: null }
  | { TooLowQuantity: null }
  | { CallIcrc1LedgerError: null }
  | { InsufficientFunds: { balance: bigint } }
export type UpperResult = { Ok: OrderId } | { Err: ReplaceOrderError }
export type UpperResult_1 = { Ok: bigint } | { Err: RegisterAssetError }
export type UpperResult_2 = { Ok: OrderId } | { Err: PlaceOrderError }
export type UpperResult_3 = { Ok: Array<OrderId> } | { Err: ManageOrdersError }
export type UpperResult_4 = { Ok: null } | { Err: CancelOrderError }
export type Withdraw =
  | {
      GenericError: { message: string; error_code: bigint }
    }
  | { TemporarilyUnavailable: null }
  | { BadBurn: { min_burn_amount: bigint } }
  | { Duplicate: { duplicate_of: bigint } }
  | { InsufficientCredit: null }
  | { BadFee: { expected_fee: bigint } }
  | { CreatedInFuture: { ledger_time: bigint } }
  | { TooOld: null }
  | { TooLowQuantity: null }
  | { CallIcrc1LedgerError: null }
  | { InsufficientFunds: { balance: bigint } }
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
  cancelAsks: ActorMethod<[Array<OrderId>, [] | [bigint]], Array<UpperResult_4>>
  cancelBids: ActorMethod<[Array<OrderId>, [] | [bigint]], Array<UpperResult_4>>
  getQuoteLedger: ActorMethod<[], Principal>
  http_request: ActorMethod<[HttpRequest], HttpResponse>
  icrc84_all_credits: ActorMethod<[], Array<[Principal, bigint]>>
  icrc84_credit: ActorMethod<[Principal], bigint>
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
  icrc84_supported_tokens: ActorMethod<[], Array<Principal>>
  icrc84_token_info: ActorMethod<[Principal], TokenInfo>
  icrc84_trackedDeposit: ActorMethod<
    [Principal],
    { Ok: bigint } | { Err: { NotAvailable: { message: string } } }
  >
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
  init: ActorMethod<[], undefined>
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
  queryPoints: ActorMethod<[], bigint>
  queryPriceHistory: ActorMethod<
    [[] | [Principal], bigint, bigint, boolean],
    Array<PriceHistoryItem>
  >
  queryTokenAsks: ActorMethod<[Principal], [Array<[OrderId, Order]>, bigint]>
  queryTokenBids: ActorMethod<[Principal], [Array<[OrderId, Order]>, bigint]>
  queryTokenHandlerDepositRegistry: ActorMethod<
    [Principal],
    [
      bigint,
      bigint,
      bigint,
      Array<[Principal, { value: bigint; lock: boolean }]>,
    ]
  >
  queryTokenHandlerJournal: ActorMethod<
    [Principal, bigint, bigint],
    Array<[Principal, LogEvent]>
  >
  queryTokenHandlerNotificationLock: ActorMethod<
    [Principal, Principal],
    [] | [{ value: bigint; lock: boolean }]
  >
  queryTokenHandlerNotificationsOnPause: ActorMethod<[Principal], boolean>
  queryTokenHandlerState: ActorMethod<
    [Principal],
    {
      balance: {
        deposited: bigint
        underway: bigint
        queued: bigint
        consolidated: bigint
      }
      flow: { withdrawn: bigint; consolidated: bigint }
      credit: { total: bigint; pool: bigint }
      ledger: { fee: bigint }
      users: { queued: bigint }
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
  queryUserAsks: ActorMethod<[Principal], Array<[OrderId, Order]>>
  queryUserBids: ActorMethod<[Principal], Array<[OrderId, Order]>>
  queryUserCredits: ActorMethod<[Principal], Array<[Principal, CreditInfo]>>
  queryUserCreditsInTokenHandler: ActorMethod<[Principal, Principal], bigint>
  queryUserDepositHistory: ActorMethod<
    [Principal, [] | [Principal], bigint, bigint],
    Array<DepositHistoryItem>
  >
  queryUserTransactionHistory: ActorMethod<
    [Principal, [] | [Principal], bigint, bigint],
    Array<TransactionHistoryItem>
  >
  registerAsset: ActorMethod<[Principal, bigint], UpperResult_1>
  removeAdmin: ActorMethod<[Principal], undefined>
  replaceAsk: ActorMethod<[OrderId, bigint, number, [] | [bigint]], UpperResult>
  replaceBid: ActorMethod<[OrderId, bigint, number, [] | [bigint]], UpperResult>
  setConsolidationTimerEnabled: ActorMethod<[boolean], undefined>
  settings: ActorMethod<
    [],
    {
      orderQuoteVolumeMinimum: bigint
      orderPriceDigitsLimit: bigint
      orderQuoteVolumeStep: bigint
    }
  >
  updateTokenHandlerFee: ActorMethod<[Principal], [] | [bigint]>
  wipeOrders: ActorMethod<[], undefined>
  wipePriceHistory: ActorMethod<[Principal], undefined>
  wipeUsers: ActorMethod<[], undefined>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]
