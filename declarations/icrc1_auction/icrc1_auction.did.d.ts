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
export type SessionNumber = bigint
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
  auction_query: ActorMethod<
    [
      Array<Token>,
      {
        last_prices: [] | [boolean]
        credits: [] | [boolean]
        asks: [] | [boolean]
        bids: [] | [boolean]
        session_numbers: [] | [boolean]
        transaction_history: [] | [[bigint, bigint]]
        reversed_history: [] | [boolean]
        price_history: [] | [[bigint, bigint, boolean]]
        deposit_history: [] | [[bigint, bigint]]
      },
    ],
    {
      last_prices: Array<[bigint, bigint, Token, bigint, number]>
      credits: Array<
        [Token, { total: bigint; locked: bigint; available: bigint }]
      >
      asks: Array<[OrderId, Order]>
      bids: Array<[OrderId, Order]>
      session_numbers: Array<[Token, SessionNumber]>
      transaction_history: Array<
        [bigint, bigint, { ask: null } | { bid: null }, Token, bigint, number]
      >
      price_history: Array<[bigint, bigint, Token, bigint, number]>
      points: bigint
      deposit_history: Array<
        [bigint, { deposit: null } | { withdrawal: null }, Token, bigint]
      >
    }
  >
  btc_depositAddress: ActorMethod<[[] | [Principal]], string>
  btc_notify: ActorMethod<
    [],
    | {
        Ok: {
          credit_inc: bigint
          credit: bigint
          deposit_inc: bigint
        }
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
                suspended_utxos:
                  | []
                  | [
                      Array<{
                        utxo: {
                          height: number
                          value: bigint
                          outpoint: {
                            txid: Uint8Array | number[]
                            vout: number
                          }
                        }
                        earliest_retry: bigint
                        reason: { ValueTooSmall: null } | { Quarantined: null }
                      }>,
                    ]
                required_confirmations: number
                pending_utxos:
                  | []
                  | [
                      Array<{
                        confirmations: number
                        value: bigint
                        outpoint: {
                          txid: Uint8Array | number[]
                          vout: number
                        }
                      }>,
                    ]
                current_confirmations: [] | [number]
              }
            }
      }
  >
  btc_withdraw: ActorMethod<
    [{ to: string; amount: bigint }],
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
  >
  btc_withdrawal_status: ActorMethod<
    [{ block_index: bigint }],
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
          reason:
            | { CallFailed: null }
            | {
                TaintedDestination: {
                  kyt_fee: bigint
                  kyt_provider: Principal
                }
              }
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
          reason:
            | { CallFailed: null }
            | {
                TaintedDestination: {
                  kyt_fee: bigint
                  kyt_provider: Principal
                }
              }
        }
      }
    | { Pending: null }
  >
  cancelAsks: ActorMethod<
    [Array<OrderId>, [] | [SessionNumber]],
    Array<CancelOrderResponse>
  >
  cancelBids: ActorMethod<
    [Array<OrderId>, [] | [SessionNumber]],
    Array<CancelOrderResponse>
  >
  cycles_withdraw: ActorMethod<
    [{ to: Principal; amount: bigint }],
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
  >
  getQuoteLedger: ActorMethod<[], Principal>
  icrc84_deposit: ActorMethod<[DepositArgs], DepositResponse>
  icrc84_notify: ActorMethod<[NotifyArg], NotifyResponse>
  icrc84_query: ActorMethod<
    [Array<Token>],
    Array<[Token, { credit: bigint; tracked_deposit: [] | [Amount] }]>
  >
  icrc84_supported_tokens: ActorMethod<[], Array<Token>>
  icrc84_token_info: ActorMethod<[Token], TokenInfo>
  icrc84_withdraw: ActorMethod<[WithdrawArgs], WithdrawResponse>
  indicativeStats: ActorMethod<[Principal], IndicativeStats>
  listAdmins: ActorMethod<[], Array<Principal>>
  manageOrders: ActorMethod<
    [[] | [CancellationArg], PlaceArg, [] | [SessionNumber]],
    ManageOrdersResponse
  >
  nextSession: ActorMethod<[], { counter: bigint; timestamp: bigint }>
  placeAsks: ActorMethod<
    [Array<[Token, bigint, number]>, [] | [SessionNumber]],
    Array<PlaceOrderResponse>
  >
  placeBids: ActorMethod<
    [Array<[Token, bigint, number]>, [] | [SessionNumber]],
    Array<PlaceOrderResponse>
  >
  principalToSubaccount: ActorMethod<[Principal], [] | [Uint8Array | number[]]>
  queryAsks: ActorMethod<[], Array<[OrderId, Order, SessionNumber]>>
  queryBids: ActorMethod<[], Array<[OrderId, Order, SessionNumber]>>
  queryCredit: ActorMethod<
    [Token],
    [{ total: bigint; locked: bigint; available: bigint }, SessionNumber]
  >
  queryCredits: ActorMethod<
    [],
    Array<
      [
        Principal,
        { total: bigint; locked: bigint; available: bigint },
        SessionNumber,
      ]
    >
  >
  queryDepositHistory: ActorMethod<
    [[] | [Token], bigint, bigint],
    Array<[bigint, { deposit: null } | { withdrawal: null }, Token, bigint]>
  >
  queryPoints: ActorMethod<[], bigint>
  queryPriceHistory: ActorMethod<
    [[] | [Token], bigint, bigint, boolean],
    Array<[bigint, bigint, Token, bigint, number]>
  >
  queryTokenAsks: ActorMethod<[Token], [Array<[OrderId, Order]>, SessionNumber]>
  queryTokenBids: ActorMethod<[Token], [Array<[OrderId, Order]>, SessionNumber]>
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
    [OrderId, bigint, number, [] | [SessionNumber]],
    ReplaceOrderResponse
  >
  replaceBid: ActorMethod<
    [OrderId, bigint, number, [] | [SessionNumber]],
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
