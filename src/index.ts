export * from './types'
export * from './readonly'
export * from './node'
export * from './safe'
export * from './persist'
export * from './utils'


import { JsonObject } from 'json-pointer'

import { createEcho } from './utils'
import { SafeNode } from './safe'

export const createRoot = <T extends JsonObject>(initial: T) => {
  return new SafeNode(initial, createEcho())
}
