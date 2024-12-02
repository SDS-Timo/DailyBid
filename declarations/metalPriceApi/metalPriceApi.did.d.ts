import type { ActorMethod } from '@dfinity/agent'
import type { IDL } from '@dfinity/candid'

export interface HttpHeader {
  value: string
  name: string
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
export interface HttpResponsePayload {
  status: bigint
  body: Uint8Array | number[]
  headers: Array<HttpHeader>
}
export interface RateInfo {
  value: number
  syncTimestamp: bigint
}
export interface TransformArgs {
  context: Uint8Array | number[]
  response: HttpResponsePayload
}
export interface _SERVICE {
  http_request: ActorMethod<[HttpRequest], HttpResponse>
  http_transform: ActorMethod<[TransformArgs], HttpResponsePayload>
  queryRates: ActorMethod<[Array<string>], Array<[] | [RateInfo]>>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]
