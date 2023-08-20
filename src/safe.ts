import { JsonObject } from 'json-pointer'
import { validate } from 'fast-json-patch'
import { filter } from 'rxjs'

import { Node } from './node'
import { PatchChannel } from './types'
import { bundle } from './utils'


export class SafeNode<T extends JsonObject> extends Node<T> {
  constructor(
    value: T,
    channel: PatchChannel,
  ) {
    super(
      value,
      bundle(
        channel.pipe(
          filter(patch => !validate(patch, this.value))
        ),
        channel
      )
    )
  }
}
