export const idlFactory = ({ IDL }) => {
  const OrderId = IDL.Nat
  const Token = IDL.Principal
  const CancelOrderResponse = IDL.Variant({
    Ok: IDL.Tuple(OrderId, Token, IDL.Nat, IDL.Float64),
    Err: IDL.Variant({
      UnknownOrder: IDL.Null,
      UnknownPrincipal: IDL.Null,
      SessionNumberMismatch: Token,
    }),
  })
  const Subaccount = IDL.Vec(IDL.Nat8)
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(Subaccount),
  })
  const Amount = IDL.Nat
  const DepositArgs = IDL.Record({
    token: Token,
    from: Account,
    amount: Amount,
    expected_fee: IDL.Opt(IDL.Nat),
  })
  const DepositResult = IDL.Record({
    credit_inc: Amount,
    txid: IDL.Nat,
    credit: IDL.Int,
  })
  const DepositResponse = IDL.Variant({
    Ok: DepositResult,
    Err: IDL.Variant({
      TransferError: IDL.Record({ message: IDL.Text }),
      AmountBelowMinimum: IDL.Record({}),
      CallLedgerError: IDL.Record({ message: IDL.Text }),
      BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    }),
  })
  const NotifyArg = IDL.Record({ token: Token })
  const NotifyResult = IDL.Record({
    credit_inc: Amount,
    credit: IDL.Int,
    deposit_inc: Amount,
  })
  const NotifyResponse = IDL.Variant({
    Ok: NotifyResult,
    Err: IDL.Variant({
      NotAvailable: IDL.Record({ message: IDL.Text }),
      CallLedgerError: IDL.Record({ message: IDL.Text }),
    }),
  })
  const TokenInfo = IDL.Record({
    allowance_fee: Amount,
    withdrawal_fee: Amount,
    deposit_fee: Amount,
  })
  const WithdrawArgs = IDL.Record({
    to: Account,
    token: Token,
    amount: Amount,
    expected_fee: IDL.Opt(IDL.Nat),
  })
  const WithdrawResponse = IDL.Variant({
    Ok: IDL.Record({ txid: IDL.Nat, amount: Amount }),
    Err: IDL.Variant({
      AmountBelowMinimum: IDL.Record({}),
      InsufficientCredit: IDL.Record({}),
      CallLedgerError: IDL.Record({ message: IDL.Text }),
      BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    }),
  })
  const IndicativeStats = IDL.Record({
    clearing: IDL.Variant({
      match: IDL.Record({ volume: IDL.Nat, price: IDL.Float64 }),
      noMatch: IDL.Record({
        minAskPrice: IDL.Opt(IDL.Float64),
        maxBidPrice: IDL.Opt(IDL.Float64),
      }),
    }),
    totalAskVolume: IDL.Nat,
    totalBidVolume: IDL.Nat,
  })
  const CancellationArg = IDL.Variant({
    all: IDL.Opt(IDL.Vec(Token)),
    orders: IDL.Vec(IDL.Variant({ ask: OrderId, bid: OrderId })),
  })
  const PlaceArg = IDL.Vec(
    IDL.Variant({
      ask: IDL.Tuple(Token, IDL.Nat, IDL.Float64),
      bid: IDL.Tuple(Token, IDL.Nat, IDL.Float64),
    }),
  )
  const ManageOrdersResponse = IDL.Variant({
    Ok: IDL.Tuple(
      IDL.Vec(IDL.Tuple(OrderId, Token, IDL.Nat, IDL.Float64)),
      IDL.Vec(OrderId),
    ),
    Err: IDL.Variant({
      placement: IDL.Record({
        error: IDL.Variant({
          ConflictingOrder: IDL.Tuple(
            IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
            IDL.Opt(OrderId),
          ),
          UnknownAsset: IDL.Null,
          NoCredit: IDL.Null,
          VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
          TooLowOrder: IDL.Null,
          PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
        }),
        index: IDL.Nat,
      }),
      UnknownPrincipal: IDL.Null,
      SessionNumberMismatch: Token,
      cancellation: IDL.Record({
        error: IDL.Variant({
          UnknownAsset: IDL.Null,
          UnknownOrder: IDL.Null,
        }),
        index: IDL.Nat,
      }),
    }),
  })
  const PlaceOrderResponse = IDL.Variant({
    Ok: OrderId,
    Err: IDL.Variant({
      ConflictingOrder: IDL.Tuple(
        IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
        IDL.Opt(OrderId),
      ),
      UnknownAsset: IDL.Null,
      NoCredit: IDL.Null,
      UnknownPrincipal: IDL.Null,
      VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
      TooLowOrder: IDL.Null,
      SessionNumberMismatch: Token,
      PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
    }),
  })
  const Order = IDL.Record({
    icrc1Ledger: Token,
    volume: IDL.Nat,
    price: IDL.Float64,
  })
  const ReplaceOrderResponse = IDL.Variant({
    Ok: OrderId,
    Err: IDL.Variant({
      ConflictingOrder: IDL.Tuple(
        IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
        IDL.Opt(OrderId),
      ),
      UnknownAsset: IDL.Null,
      UnknownOrder: IDL.Null,
      NoCredit: IDL.Null,
      UnknownPrincipal: IDL.Null,
      VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
      TooLowOrder: IDL.Null,
      SessionNumberMismatch: Token,
      PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
    }),
  })
  return IDL.Service({
    addAdmin: IDL.Func([IDL.Principal], [], []),
    cancelAsks: IDL.Func(
      [IDL.Vec(OrderId), IDL.Opt(IDL.Nat)],
      [IDL.Vec(CancelOrderResponse)],
      [],
    ),
    cancelBids: IDL.Func(
      [IDL.Vec(OrderId), IDL.Opt(IDL.Nat)],
      [IDL.Vec(CancelOrderResponse)],
      [],
    ),
    getQuoteLedger: IDL.Func([], [IDL.Principal], ['query']),
    icrc84_deposit: IDL.Func([DepositArgs], [DepositResponse], []),
    icrc84_notify: IDL.Func([NotifyArg], [NotifyResponse], []),
    icrc84_query: IDL.Func(
      [IDL.Vec(IDL.Principal)],
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Principal,
            IDL.Record({
              credit: IDL.Int,
              tracked_deposit: IDL.Opt(IDL.Nat),
            }),
          ),
        ),
      ],
      ['query'],
    ),
    icrc84_supported_tokens: IDL.Func([], [IDL.Vec(Token)], ['query']),
    icrc84_token_info: IDL.Func([Token], [TokenInfo], ['query']),
    icrc84_withdraw: IDL.Func([WithdrawArgs], [WithdrawResponse], []),
    indicativeStats: IDL.Func([IDL.Principal], [IndicativeStats], ['query']),
    listAdmins: IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    manageOrders: IDL.Func(
      [IDL.Opt(CancellationArg), PlaceArg, IDL.Opt(IDL.Nat)],
      [ManageOrdersResponse],
      [],
    ),
    nextSession: IDL.Func(
      [],
      [IDL.Record({ counter: IDL.Nat, timestamp: IDL.Nat })],
      ['query'],
    ),
    placeAsks: IDL.Func(
      [IDL.Vec(IDL.Tuple(Token, IDL.Nat, IDL.Float64)), IDL.Opt(IDL.Nat)],
      [IDL.Vec(PlaceOrderResponse)],
      [],
    ),
    placeBids: IDL.Func(
      [IDL.Vec(IDL.Tuple(Token, IDL.Nat, IDL.Float64)), IDL.Opt(IDL.Nat)],
      [IDL.Vec(PlaceOrderResponse)],
      [],
    ),
    principalToSubaccount: IDL.Func(
      [IDL.Principal],
      [IDL.Opt(IDL.Vec(IDL.Nat8))],
      ['query'],
    ),
    queryAsks: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(OrderId, Order, IDL.Nat))],
      ['query'],
    ),
    queryBids: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(OrderId, Order, IDL.Nat))],
      ['query'],
    ),
    queryCredit: IDL.Func(
      [Token],
      [
        IDL.Record({
          total: IDL.Nat,
          locked: IDL.Nat,
          available: IDL.Nat,
        }),
        IDL.Nat,
      ],
      ['query'],
    ),
    queryCredits: IDL.Func(
      [],
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Principal,
            IDL.Record({
              total: IDL.Nat,
              locked: IDL.Nat,
              available: IDL.Nat,
            }),
            IDL.Nat,
          ),
        ),
      ],
      ['query'],
    ),
    queryDepositHistory: IDL.Func(
      [IDL.Opt(Token), IDL.Nat, IDL.Nat],
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Nat64,
            IDL.Variant({
              deposit: IDL.Null,
              withdrawal: IDL.Null,
              withdrawalRollback: IDL.Null,
            }),
            Token,
            IDL.Nat,
          ),
        ),
      ],
      ['query'],
    ),
    queryPoints: IDL.Func([], [IDL.Nat], ['query']),
    queryPriceHistory: IDL.Func(
      [IDL.Opt(Token), IDL.Nat, IDL.Nat, IDL.Bool],
      [IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Nat, Token, IDL.Nat, IDL.Float64))],
      ['query'],
    ),
    queryTokenAsks: IDL.Func(
      [Token],
      [IDL.Vec(IDL.Tuple(OrderId, Order)), IDL.Nat],
      ['query'],
    ),
    queryTokenBids: IDL.Func(
      [Token],
      [IDL.Vec(IDL.Tuple(OrderId, Order)), IDL.Nat],
      ['query'],
    ),
    queryTransactionHistory: IDL.Func(
      [IDL.Opt(Token), IDL.Nat, IDL.Nat],
      [
        IDL.Vec(
          IDL.Tuple(
            IDL.Nat64,
            IDL.Nat,
            IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
            Token,
            IDL.Nat,
            IDL.Float64,
          ),
        ),
      ],
      ['query'],
    ),
    registerAsset: IDL.Func(
      [IDL.Principal, IDL.Nat],
      [
        IDL.Variant({
          Ok: IDL.Nat,
          Err: IDL.Variant({ AlreadyRegistered: IDL.Null }),
        }),
      ],
      [],
    ),
    removeAdmin: IDL.Func([IDL.Principal], [], []),
    replaceAsk: IDL.Func(
      [OrderId, IDL.Nat, IDL.Float64, IDL.Opt(IDL.Nat)],
      [ReplaceOrderResponse],
      [],
    ),
    replaceBid: IDL.Func(
      [OrderId, IDL.Nat, IDL.Float64, IDL.Opt(IDL.Nat)],
      [ReplaceOrderResponse],
      [],
    ),
    settings: IDL.Func(
      [],
      [
        IDL.Record({
          orderQuoteVolumeMinimum: IDL.Nat,
          orderPriceDigitsLimit: IDL.Nat,
          orderQuoteVolumeStep: IDL.Nat,
        }),
      ],
      ['query'],
    ),
  })
}
export const init = ({ IDL }) => {
  return [IDL.Opt(IDL.Principal), IDL.Opt(IDL.Principal)]
}
