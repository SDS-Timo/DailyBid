import type { ActorMethod } from '@dfinity/agent'
import type { IDL } from '@dfinity/candid'
import type { Principal } from '@dfinity/principal'

export interface Account {
  owner: Principal
  subaccount: [] | [Subaccount]
}
export type Amount = bigint
export type CancelOrderResponse =
  | { Ok: [OrderId, Token, bigint, number] }
  | {
      Err:
        | { UnknownOrder: null }
        | { UnknownPrincipal: null }
        | { SessionNumberMismatch: Token }
    }
export type CancellationArg =
  | { all: [] | [Array<Token>] }
  | { orders: Array<{ ask: OrderId } | { bid: OrderId }> }
export interface DepositArgs {
  token: Token
  from: Account
  amount: Amount
  expected_fee: [] | [bigint]
}
export type DepositResponse =
  | { Ok: DepositResult }
  | {
      Err:
        | { TransferError: { message: string } }
        | { AmountBelowMinimum: object }
        | { CallLedgerError: { message: string } }
        | { BadFee: { expected_fee: bigint } }
    }
export interface DepositResult {
  credit_inc: Amount
  txid: bigint
  credit: bigint
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
export type ManageOrdersResponse =
  | {
      Ok: [Array<[OrderId, Token, bigint, number]>, Array<OrderId>]
    }
  | {
      Err:
        | {
            placement: {
              error:
                | {
                    ConflictingOrder: [
                      { ask: null } | { bid: null },
                      [] | [OrderId],
                    ]
                  }
                | { UnknownAsset: null }
                | { NoCredit: null }
                | { VolumeStepViolated: { baseVolumeStep: bigint } }
                | { TooLowOrder: null }
                | { PriceDigitsOverflow: { maxDigits: bigint } }
              index: bigint
            }
          }
        | { UnknownPrincipal: null }
        | { SessionNumberMismatch: Token }
        | {
            cancellation: {
              error: { UnknownAsset: null } | { UnknownOrder: null }
              index: bigint
            }
          }
    }
export interface NotifyArg {
  token: Token
}
export type NotifyResponse =
  | { Ok: NotifyResult }
  | {
      Err:
        | { NotAvailable: { message: string } }
        | { CallLedgerError: { message: string } }
    }
export interface NotifyResult {
  credit_inc: Amount
  credit: bigint
  deposit_inc: Amount
}
export interface Order {
  icrc1Ledger: Token
  volume: bigint
  price: number
}
export type OrderId = bigint
export type PlaceArg = Array<
  { ask: [Token, bigint, number] } | { bid: [Token, bigint, number] }
>
export type PlaceOrderResponse =
  | { Ok: OrderId }
  | {
      Err:
        | {
            ConflictingOrder: [{ ask: null } | { bid: null }, [] | [OrderId]]
          }
        | { UnknownAsset: null }
        | { NoCredit: null }
        | { UnknownPrincipal: null }
        | { VolumeStepViolated: { baseVolumeStep: bigint } }
        | { TooLowOrder: null }
        | { SessionNumberMismatch: Token }
        | { PriceDigitsOverflow: { maxDigits: bigint } }
    }
export type ReplaceOrderResponse =
  | { Ok: OrderId }
  | {
      Err:
        | {
            ConflictingOrder: [{ ask: null } | { bid: null }, [] | [OrderId]]
          }
        | { UnknownAsset: null }
        | { UnknownOrder: null }
        | { NoCredit: null }
        | { UnknownPrincipal: null }
        | { VolumeStepViolated: { baseVolumeStep: bigint } }
        | { TooLowOrder: null }
        | { SessionNumberMismatch: Token }
        | { PriceDigitsOverflow: { maxDigits: bigint } }
    }
export type Subaccount = Uint8Array | number[]
export type Token = Principal
export interface TokenInfo {
  allowance_fee: Amount
  withdrawal_fee: Amount
  deposit_fee: Amount
}
export interface WithdrawArgs {
  to: Account
  token: Token
  amount: Amount
  expected_fee: [] | [bigint]
}
export type WithdrawResponse =
  | {
      Ok: { txid: bigint; amount: Amount }
    }
  | {
      Err:
        | { AmountBelowMinimum: object }
        | { InsufficientCredit: object }
        | { CallLedgerError: { message: string } }
        | { BadFee: { expected_fee: bigint } }
    }
export interface _SERVICE {
  addAdmin: ActorMethod<[Principal], undefined>
  cancelAsks: ActorMethod<
    [Array<OrderId>, [] | [bigint]],
    Array<CancelOrderResponse>
  >
  cancelBids: ActorMethod<
    [Array<OrderId>, [] | [bigint]],
    Array<CancelOrderResponse>
  >
  getQuoteLedger: ActorMethod<[], Principal>
  icrc84_deposit: ActorMethod<[DepositArgs], DepositResponse>
  icrc84_notify: ActorMethod<[NotifyArg], NotifyResponse>
  icrc84_query: ActorMethod<
    [Array<Principal>],
    Array<[Principal, { credit: bigint; tracked_deposit: [] | [bigint] }]>
  >
  icrc84_supported_tokens: ActorMethod<[], Array<Token>>
  icrc84_token_info: ActorMethod<[Token], TokenInfo>
  icrc84_withdraw: ActorMethod<[WithdrawArgs], WithdrawResponse>
  indicativeStats: ActorMethod<[Principal], IndicativeStats>
  listAdmins: ActorMethod<[], Array<Principal>>
  manageOrders: ActorMethod<
    [[] | [CancellationArg], PlaceArg, [] | [bigint]],
    ManageOrdersResponse
  >
  nextSession: ActorMethod<[], { counter: bigint; timestamp: bigint }>
  placeAsks: ActorMethod<
    [Array<[Token, bigint, number]>, [] | [bigint]],
    Array<PlaceOrderResponse>
  >
  placeBids: ActorMethod<
    [Array<[Token, bigint, number]>, [] | [bigint]],
    Array<PlaceOrderResponse>
  >
  principalToSubaccount: ActorMethod<[Principal], [] | [Uint8Array | number[]]>
  queryAsks: ActorMethod<[], Array<[OrderId, Order, bigint]>>
  queryBids: ActorMethod<[], Array<[OrderId, Order, bigint]>>
  queryCredit: ActorMethod<
    [Token],
    [{ total: bigint; locked: bigint; available: bigint }, bigint]
  >
  queryCredits: ActorMethod<
    [],
    Array<
      [Principal, { total: bigint; locked: bigint; available: bigint }, bigint]
    >
  >
  queryDepositHistory: ActorMethod<
    [[] | [Token], bigint, bigint],
    Array<
      [
        bigint,
        { deposit: null } | { withdrawal: null } | { withdrawalRollback: null },
        Token,
        bigint,
      ]
    >
  >
  queryPoints: ActorMethod<[], bigint>
  queryPriceHistory: ActorMethod<
    [[] | [Token], bigint, bigint, boolean],
    Array<[bigint, bigint, Token, bigint, number]>
  >
  queryTokenAsks: ActorMethod<[Token], [Array<[OrderId, Order]>, bigint]>
  queryTokenBids: ActorMethod<[Token], [Array<[OrderId, Order]>, bigint]>
  queryTransactionHistory: ActorMethod<
    [[] | [Token], bigint, bigint],
    Array<
      [bigint, bigint, { ask: null } | { bid: null }, Token, bigint, number]
    >
  >
  registerAsset: ActorMethod<
    [Principal, bigint],
    { Ok: bigint } | { Err: { AlreadyRegistered: null } }
  >
  removeAdmin: ActorMethod<[Principal], undefined>
  replaceAsk: ActorMethod<
    [OrderId, bigint, number, [] | [bigint]],
    ReplaceOrderResponse
  >
  replaceBid: ActorMethod<
    [OrderId, bigint, number, [] | [bigint]],
    ReplaceOrderResponse
  >
  settings: ActorMethod<
    [],
    {
      orderQuoteVolumeMinimum: bigint
      orderPriceDigitsLimit: bigint
      orderQuoteVolumeStep: bigint
    }
  >
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]
