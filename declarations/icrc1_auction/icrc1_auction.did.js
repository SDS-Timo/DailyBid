export const idlFactory = ({ IDL }) => {
  const AuctionQuerySelection = IDL.Record({
    credits: IDL.Opt(IDL.Bool),
    asks: IDL.Opt(IDL.Bool),
    bids: IDL.Opt(IDL.Bool),
    session_numbers: IDL.Opt(IDL.Bool),
    transaction_history: IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat)),
    price_history: IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Bool)),
    deposit_history: IDL.Opt(IDL.Tuple(IDL.Nat, IDL.Nat)),
  })
  const CreditInfo = IDL.Record({
    total: IDL.Nat,
    locked: IDL.Nat,
    available: IDL.Nat,
  })
  const OrderId = IDL.Nat
  const Order = IDL.Record({
    icrc1Ledger: IDL.Principal,
    volume: IDL.Nat,
    price: IDL.Float64,
  })
  const TransactionHistoryItem = IDL.Tuple(
    IDL.Nat64,
    IDL.Nat,
    IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
    IDL.Principal,
    IDL.Nat,
    IDL.Float64,
  )
  const PriceHistoryItem = IDL.Tuple(
    IDL.Nat64,
    IDL.Nat,
    IDL.Principal,
    IDL.Nat,
    IDL.Float64,
  )
  const DepositHistoryItem = IDL.Tuple(
    IDL.Nat64,
    IDL.Variant({ deposit: IDL.Null, withdrawal: IDL.Null }),
    IDL.Principal,
    IDL.Nat,
  )
  const AuctionQueryResponse = IDL.Record({
    credits: IDL.Vec(IDL.Tuple(IDL.Principal, CreditInfo)),
    asks: IDL.Vec(IDL.Tuple(OrderId, Order)),
    bids: IDL.Vec(IDL.Tuple(OrderId, Order)),
    session_numbers: IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
    transaction_history: IDL.Vec(TransactionHistoryItem),
    price_history: IDL.Vec(PriceHistoryItem),
    points: IDL.Nat,
    deposit_history: IDL.Vec(DepositHistoryItem),
  })
  const Utxo = IDL.Record({
    height: IDL.Nat32,
    value: IDL.Nat64,
    outpoint: IDL.Record({ txid: IDL.Vec(IDL.Nat8), vout: IDL.Nat32 }),
  })
  const SuspendedReason = IDL.Variant({
    ValueTooSmall: IDL.Null,
    Quarantined: IDL.Null,
  })
  const SuspendedUtxo = IDL.Record({
    utxo: Utxo,
    earliest_retry: IDL.Nat64,
    reason: SuspendedReason,
  })
  const PendingUtxo = IDL.Record({
    confirmations: IDL.Nat32,
    value: IDL.Nat64,
    outpoint: IDL.Record({ txid: IDL.Vec(IDL.Nat8), vout: IDL.Nat32 }),
  })
  const BtcNotifyResult = IDL.Variant({
    Ok: IDL.Record({
      credit_inc: IDL.Nat,
      credit: IDL.Int,
      deposit_inc: IDL.Nat,
    }),
    Err: IDL.Variant({
      GenericError: IDL.Record({
        error_message: IDL.Text,
        error_code: IDL.Nat64,
      }),
      NotAvailable: IDL.Record({ message: IDL.Text }),
      TemporarilyUnavailable: IDL.Text,
      AlreadyProcessing: IDL.Null,
      NotMinted: IDL.Null,
      CallLedgerError: IDL.Record({ message: IDL.Text }),
      NoNewUtxos: IDL.Record({
        suspended_utxos: IDL.Opt(IDL.Vec(SuspendedUtxo)),
        required_confirmations: IDL.Nat32,
        pending_utxos: IDL.Opt(IDL.Vec(PendingUtxo)),
        current_confirmations: IDL.Opt(IDL.Nat32),
      }),
    }),
  })
  const BtcWithdrawResult = IDL.Variant({
    Ok: IDL.Record({ block_index: IDL.Nat64 }),
    Err: IDL.Variant({
      MalformedAddress: IDL.Text,
      GenericError: IDL.Record({ error_code: IDL.Reserved }),
      TemporarilyUnavailable: IDL.Reserved,
      InsufficientAllowance: IDL.Record({ allowance: IDL.Nat64 }),
      AlreadyProcessing: IDL.Null,
      Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
      InsufficientCredit: IDL.Record({}),
      BadFee: IDL.Record({ expected_fee: IDL.Nat }),
      AmountTooLow: IDL.Nat64,
      AllowanceChanged: IDL.Record({ current_allowance: IDL.Nat }),
      CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
      TooOld: IDL.Null,
      Expired: IDL.Record({ ledger_time: IDL.Nat64 }),
      InsufficientFunds: IDL.Record({ balance: IDL.Reserved }),
    }),
  })
  const ReimbursementReason = IDL.Variant({
    CallFailed: IDL.Null,
    TaintedDestination: IDL.Record({
      kyt_fee: IDL.Nat64,
      kyt_provider: IDL.Principal,
    }),
  })
  const RetrieveBtcStatusV2 = IDL.Variant({
    Signing: IDL.Null,
    Confirmed: IDL.Record({ txid: IDL.Vec(IDL.Nat8) }),
    Sending: IDL.Record({ txid: IDL.Vec(IDL.Nat8) }),
    AmountTooLow: IDL.Null,
    WillReimburse: IDL.Record({
      account: IDL.Record({
        owner: IDL.Principal,
        subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
      }),
      amount: IDL.Nat64,
      reason: ReimbursementReason,
    }),
    Unknown: IDL.Null,
    Submitted: IDL.Record({ txid: IDL.Vec(IDL.Nat8) }),
    Reimbursed: IDL.Record({
      account: IDL.Record({
        owner: IDL.Principal,
        subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
      }),
      mint_block_index: IDL.Nat64,
      amount: IDL.Nat64,
      reason: ReimbursementReason,
    }),
    Pending: IDL.Null,
  })
  const OrderId__1 = IDL.Nat
  const CancellationResult = IDL.Tuple(
    OrderId__1,
    IDL.Principal,
    IDL.Nat,
    IDL.Float64,
  )
  const CancelOrderError = IDL.Variant({
    UnknownOrder: IDL.Null,
    UnknownPrincipal: IDL.Null,
    SessionNumberMismatch: IDL.Principal,
  })
  const UpperResult_4 = IDL.Variant({
    Ok: CancellationResult,
    Err: CancelOrderError,
  })
  const DirectCyclesWithdrawResult = IDL.Variant({
    Ok: IDL.Record({ amount: IDL.Nat }),
    Err: IDL.Variant({
      FailedToWithdraw: IDL.Record({
        rejection_code: IDL.Variant({
          NoError: IDL.Null,
          CanisterError: IDL.Null,
          SysTransient: IDL.Null,
          DestinationInvalid: IDL.Null,
          Unknown: IDL.Null,
          SysFatal: IDL.Null,
          CanisterReject: IDL.Null,
        }),
        fee_block: IDL.Opt(IDL.Nat),
        rejection_reason: IDL.Text,
      }),
      GenericError: IDL.Record({
        message: IDL.Text,
        error_code: IDL.Nat,
      }),
      TemporarilyUnavailable: IDL.Null,
      Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
      InsufficientCredit: IDL.Record({}),
      BadFee: IDL.Record({ expected_fee: IDL.Nat }),
      InvalidReceiver: IDL.Record({ receiver: IDL.Principal }),
      CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
      TooLowAmount: IDL.Record({}),
      TooOld: IDL.Null,
      InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
    }),
  })
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  })
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    status_code: IDL.Nat16,
  })
  const DepositResult = IDL.Variant({
    Ok: IDL.Record({
      credit_inc: IDL.Nat,
      txid: IDL.Nat,
      credit: IDL.Int,
    }),
    Err: IDL.Variant({
      TransferError: IDL.Record({ message: IDL.Text }),
      AmountBelowMinimum: IDL.Record({}),
      CallLedgerError: IDL.Record({ message: IDL.Text }),
      BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    }),
  })
  const NotifyResult = IDL.Variant({
    Ok: IDL.Record({
      credit_inc: IDL.Nat,
      credit: IDL.Int,
      deposit_inc: IDL.Nat,
    }),
    Err: IDL.Variant({
      NotAvailable: IDL.Record({ message: IDL.Text }),
      CallLedgerError: IDL.Record({ message: IDL.Text }),
    }),
  })
  const TokenInfo = IDL.Record({
    allowance_fee: IDL.Nat,
    withdrawal_fee: IDL.Nat,
    deposit_fee: IDL.Nat,
  })
  const WithdrawResult = IDL.Variant({
    Ok: IDL.Record({ txid: IDL.Nat, amount: IDL.Nat }),
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
  const InternalPlaceOrderError = IDL.Variant({
    ConflictingOrder: IDL.Tuple(
      IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
      IDL.Opt(OrderId__1),
    ),
    UnknownAsset: IDL.Null,
    NoCredit: IDL.Null,
    VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
    TooLowOrder: IDL.Null,
    PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
  })
  const ManageOrdersError = IDL.Variant({
    placement: IDL.Record({
      error: InternalPlaceOrderError,
      index: IDL.Nat,
    }),
    UnknownPrincipal: IDL.Null,
    SessionNumberMismatch: IDL.Principal,
    cancellation: IDL.Record({
      error: IDL.Variant({
        UnknownAsset: IDL.Null,
        UnknownOrder: IDL.Null,
      }),
      index: IDL.Nat,
    }),
  })
  const UpperResult_3 = IDL.Variant({
    Ok: IDL.Tuple(IDL.Vec(CancellationResult), IDL.Vec(OrderId)),
    Err: ManageOrdersError,
  })
  const PlaceOrderError = IDL.Variant({
    ConflictingOrder: IDL.Tuple(
      IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
      IDL.Opt(OrderId__1),
    ),
    UnknownAsset: IDL.Null,
    NoCredit: IDL.Null,
    UnknownPrincipal: IDL.Null,
    VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
    TooLowOrder: IDL.Null,
    SessionNumberMismatch: IDL.Principal,
    PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
  })
  const UpperResult_2 = IDL.Variant({
    Ok: OrderId,
    Err: PlaceOrderError,
  })
  const UserOrder = IDL.Record({
    user: IDL.Principal,
    volume: IDL.Nat,
    price: IDL.Float64,
  })
  const Subaccount = IDL.Vec(IDL.Nat8)
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(Subaccount),
  })
  const LogEvent = IDL.Variant({
    depositInc: IDL.Nat,
    withdraw: IDL.Record({
      to: Account,
      surcharge: IDL.Nat,
      withdrawn: IDL.Nat,
      amount: IDL.Nat,
    }),
    surchargeUpdated: IDL.Record({ new: IDL.Nat, old: IDL.Nat }),
    debited: IDL.Nat,
    locked: IDL.Int,
    error: IDL.Text,
    allowanceDrawn: IDL.Record({
      surcharge: IDL.Nat,
      amount: IDL.Nat,
      credited: IDL.Nat,
    }),
    newDeposit: IDL.Record({
      depositInc: IDL.Nat,
      surcharge: IDL.Nat,
      creditInc: IDL.Nat,
      ledgerFee: IDL.Nat,
    }),
    feeUpdated: IDL.Record({
      new: IDL.Nat,
      old: IDL.Nat,
      delta: IDL.Int,
    }),
    consolidated: IDL.Record({
      fee: IDL.Nat,
      deducted: IDL.Nat,
      credited: IDL.Nat,
    }),
    credited: IDL.Nat,
  })
  const RegisterAssetError = IDL.Variant({ AlreadyRegistered: IDL.Null })
  const UpperResult_1 = IDL.Variant({
    Ok: IDL.Nat,
    Err: RegisterAssetError,
  })
  const ReplaceOrderError = IDL.Variant({
    ConflictingOrder: IDL.Tuple(
      IDL.Variant({ ask: IDL.Null, bid: IDL.Null }),
      IDL.Opt(OrderId__1),
    ),
    UnknownAsset: IDL.Null,
    UnknownOrder: IDL.Null,
    NoCredit: IDL.Null,
    UnknownPrincipal: IDL.Null,
    VolumeStepViolated: IDL.Record({ baseVolumeStep: IDL.Nat }),
    TooLowOrder: IDL.Null,
    SessionNumberMismatch: IDL.Principal,
    PriceDigitsOverflow: IDL.Record({ maxDigits: IDL.Nat }),
  })
  const UpperResult = IDL.Variant({
    Ok: OrderId,
    Err: ReplaceOrderError,
  })
  return IDL.Service({
    addAdmin: IDL.Func([IDL.Principal], [], []),
    auction_query: IDL.Func(
      [IDL.Vec(IDL.Principal), AuctionQuerySelection],
      [AuctionQueryResponse],
      ['query'],
    ),
    btc_depositAddress: IDL.Func(
      [IDL.Opt(IDL.Principal)],
      [IDL.Text],
      ['query'],
    ),
    btc_notify: IDL.Func([], [BtcNotifyResult], []),
    btc_withdraw: IDL.Func(
      [IDL.Record({ to: IDL.Text, amount: IDL.Nat })],
      [BtcWithdrawResult],
      [],
    ),
    btc_withdrawal_status: IDL.Func(
      [IDL.Record({ block_index: IDL.Nat64 })],
      [RetrieveBtcStatusV2],
      [],
    ),
    cancelAsks: IDL.Func(
      [IDL.Vec(OrderId), IDL.Opt(IDL.Nat)],
      [IDL.Vec(UpperResult_4)],
      [],
    ),
    cancelBids: IDL.Func(
      [IDL.Vec(OrderId), IDL.Opt(IDL.Nat)],
      [IDL.Vec(UpperResult_4)],
      [],
    ),
    cycles_withdraw: IDL.Func(
      [IDL.Record({ to: IDL.Principal, amount: IDL.Nat })],
      [DirectCyclesWithdrawResult],
      [],
    ),
    getQuoteLedger: IDL.Func([], [IDL.Principal], ['query']),
    http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
    icrc84_deposit: IDL.Func(
      [
        IDL.Record({
          token: IDL.Principal,
          from: IDL.Record({
            owner: IDL.Principal,
            subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          }),
          amount: IDL.Nat,
          expected_fee: IDL.Opt(IDL.Nat),
        }),
      ],
      [DepositResult],
      [],
    ),
    icrc84_notify: IDL.Func(
      [IDL.Record({ token: IDL.Principal })],
      [NotifyResult],
      [],
    ),
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
    icrc84_supported_tokens: IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    icrc84_token_info: IDL.Func([IDL.Principal], [TokenInfo], ['query']),
    icrc84_withdraw: IDL.Func(
      [
        IDL.Record({
          to: IDL.Record({
            owner: IDL.Principal,
            subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          }),
          token: IDL.Principal,
          amount: IDL.Nat,
          expected_fee: IDL.Opt(IDL.Nat),
        }),
      ],
      [WithdrawResult],
      [],
    ),
    indicativeStats: IDL.Func([IDL.Principal], [IndicativeStats], ['query']),
    isTokenHandlerFrozen: IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    listAdmins: IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    manageOrders: IDL.Func(
      [
        IDL.Opt(
          IDL.Variant({
            all: IDL.Opt(IDL.Vec(IDL.Principal)),
            orders: IDL.Vec(IDL.Variant({ ask: OrderId, bid: OrderId })),
          }),
        ),
        IDL.Vec(
          IDL.Variant({
            ask: IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Float64),
            bid: IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Float64),
          }),
        ),
        IDL.Opt(IDL.Nat),
      ],
      [UpperResult_3],
      [],
    ),
    nextSession: IDL.Func(
      [],
      [IDL.Record({ counter: IDL.Nat, timestamp: IDL.Nat })],
      ['query'],
    ),
    placeAsks: IDL.Func(
      [
        IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Float64)),
        IDL.Opt(IDL.Nat),
      ],
      [IDL.Vec(UpperResult_2)],
      [],
    ),
    placeBids: IDL.Func(
      [
        IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat, IDL.Float64)),
        IDL.Opt(IDL.Nat),
      ],
      [IDL.Vec(UpperResult_2)],
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
    queryCredit: IDL.Func([IDL.Principal], [CreditInfo, IDL.Nat], ['query']),
    queryCredits: IDL.Func(
      [],
      [IDL.Vec(IDL.Tuple(IDL.Principal, CreditInfo, IDL.Nat))],
      ['query'],
    ),
    queryDepositHistory: IDL.Func(
      [IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat],
      [IDL.Vec(DepositHistoryItem)],
      ['query'],
    ),
    queryOrderBook: IDL.Func(
      [IDL.Principal],
      [
        IDL.Record({
          asks: IDL.Vec(IDL.Tuple(OrderId, UserOrder)),
          bids: IDL.Vec(IDL.Tuple(OrderId, UserOrder)),
        }),
      ],
      ['query'],
    ),
    queryPoints: IDL.Func([], [IDL.Nat], ['query']),
    queryPriceHistory: IDL.Func(
      [IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat, IDL.Bool],
      [IDL.Vec(PriceHistoryItem)],
      ['query'],
    ),
    queryTokenAsks: IDL.Func(
      [IDL.Principal],
      [IDL.Vec(IDL.Tuple(OrderId, Order)), IDL.Nat],
      ['query'],
    ),
    queryTokenBids: IDL.Func(
      [IDL.Principal],
      [IDL.Vec(IDL.Tuple(OrderId, Order)), IDL.Nat],
      ['query'],
    ),
    queryTokenHandlerJournal: IDL.Func(
      [IDL.Principal, IDL.Nat, IDL.Nat],
      [IDL.Vec(IDL.Tuple(IDL.Principal, LogEvent))],
      ['query'],
    ),
    queryTokenHandlerNotificationsOnPause: IDL.Func(
      [IDL.Principal],
      [IDL.Bool],
      ['query'],
    ),
    queryTokenHandlerState: IDL.Func(
      [IDL.Principal],
      [
        IDL.Record({
          balance: IDL.Record({
            deposited: IDL.Nat,
            underway: IDL.Nat,
            usableDeposit: IDL.Tuple(IDL.Int, IDL.Bool),
            queued: IDL.Nat,
            consolidated: IDL.Nat,
          }),
          flow: IDL.Record({
            withdrawn: IDL.Nat,
            consolidated: IDL.Nat,
          }),
          feeManager: IDL.Record({
            surcharge: IDL.Nat,
            deposit: IDL.Nat,
            outstandingFees: IDL.Nat,
            ledger: IDL.Nat,
          }),
          credit: IDL.Record({ total: IDL.Int, pool: IDL.Int }),
          users: IDL.Record({
            total: IDL.Nat,
            locked: IDL.Nat,
            queued: IDL.Nat,
          }),
          withdrawalManager: IDL.Record({
            lockedFunds: IDL.Nat,
            totalWithdrawn: IDL.Nat,
          }),
          depositManager: IDL.Record({
            totalConsolidated: IDL.Nat,
            funds: IDL.Record({
              deposited: IDL.Nat,
              underway: IDL.Nat,
              queued: IDL.Nat,
            }),
            totalCredited: IDL.Nat,
            paused: IDL.Bool,
          }),
        }),
      ],
      ['query'],
    ),
    queryTransactionHistory: IDL.Func(
      [IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat],
      [IDL.Vec(TransactionHistoryItem)],
      ['query'],
    ),
    queryTransactionHistoryForward: IDL.Func(
      [IDL.Opt(IDL.Principal), IDL.Nat, IDL.Nat],
      [IDL.Vec(TransactionHistoryItem), IDL.Nat, IDL.Bool],
      ['query'],
    ),
    queryUserCreditsInTokenHandler: IDL.Func(
      [IDL.Principal, IDL.Principal],
      [IDL.Int],
      ['query'],
    ),
    registerAsset: IDL.Func([IDL.Principal, IDL.Nat], [UpperResult_1], []),
    removeAdmin: IDL.Func([IDL.Principal], [], []),
    replaceAsk: IDL.Func(
      [OrderId, IDL.Nat, IDL.Float64, IDL.Opt(IDL.Nat)],
      [UpperResult],
      [],
    ),
    replaceBid: IDL.Func(
      [OrderId, IDL.Nat, IDL.Float64, IDL.Opt(IDL.Nat)],
      [UpperResult],
      [],
    ),
    restartAuctionTimer: IDL.Func([], [], []),
    setConsolidationTimerEnabled: IDL.Func([IDL.Bool], [], []),
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
    totalPointsSupply: IDL.Func([], [IDL.Nat], ['query']),
    updateTokenHandlerFee: IDL.Func([IDL.Principal], [IDL.Opt(IDL.Nat)], []),
    user_auction_query: IDL.Func(
      [IDL.Principal, IDL.Vec(IDL.Principal), AuctionQuerySelection],
      [AuctionQueryResponse],
      ['query'],
    ),
    wipeOrders: IDL.Func([], [], []),
    wipePriceHistory: IDL.Func([IDL.Principal], [], []),
    wipeUsers: IDL.Func([], [], []),
  })
}
export const init = ({ IDL }) => {
  return [IDL.Opt(IDL.Principal), IDL.Opt(IDL.Principal)]
}
