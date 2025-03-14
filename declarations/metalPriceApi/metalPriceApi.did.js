export const idlFactory = ({ IDL }) => {
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
  const HttpHeader = IDL.Record({ value: IDL.Text, name: IDL.Text })
  const HttpResponsePayload = IDL.Record({
    status: IDL.Nat,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HttpHeader),
  })
  const TransformArgs = IDL.Record({
    context: IDL.Vec(IDL.Nat8),
    response: HttpResponsePayload,
  })
  const RateInfo = IDL.Record({
    value: IDL.Float64,
    timestamp: IDL.Nat,
  })
  return IDL.Service({
    http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
    http_transform: IDL.Func([TransformArgs], [HttpResponsePayload], ['query']),
    pushRates: IDL.Func(
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Float64))],
      [],
      ['oneway'],
    ),
    queryRates: IDL.Func(
      [IDL.Vec(IDL.Text)],
      [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Opt(RateInfo)))],
      ['query'],
    ),
  })
}

export const init = ({ IDL }) => {
  return [IDL.Opt(IDL.Principal), IDL.Opt(IDL.Principal)]
}
