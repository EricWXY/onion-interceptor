import type { Opeartion, AxiosInstanceLike } from './types'
import { isOpeartionKey } from './constants'

export const isFunction = (val: unknown): val is Function => typeof val === 'function'

/**
 * Determines whether it is an operator.
 * @param val
 */
export const isOperation = (val: unknown): val is Function & Opeartion =>
  isFunction(val) && (val as Opeartion)[isOpeartionKey] === true

export const isNil = (val: unknown): val is null | undefined => val == null
// export const isObject = (val: unknown): val is Record<any, any> =>
//   val !== null && typeof val === 'object'

export const isAxiosInstanceLike = (val: unknown): val is AxiosInstanceLike =>
  !isNil((val as AxiosInstanceLike)?.request) && isFunction((val as AxiosInstanceLike)?.request)
