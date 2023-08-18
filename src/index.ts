export * from './types'
export * from './readonly'
export * from './node'
export * from './safe'
export * from './echo'

import { JsonObject } from 'json-pointer'

import { createEcho } from './echo'
import { SafeNode } from './safe'

export const createRoot = <T extends JsonObject>(initial: T) => {
  const echo = createEcho()

  return new SafeNode(initial, echo, echo)
}
