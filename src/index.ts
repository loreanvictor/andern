export * from './types'
export * from './readonly'
export * from './node'
export * from './echo'

import { JsonObject } from 'json-pointer'

import { createEcho } from './echo'
import { Node } from './node'

export const createRoot = <T extends JsonObject>(initial: T) => {
  const echo = createEcho()

  return new Node(initial, echo, echo)
}
