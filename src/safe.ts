import { JsonObject } from 'json-pointer'
import { validate } from 'fast-json-patch'
import { filter } from 'rxjs'

import { Node } from './node'
import { PatchChannel, PatchStream } from './types'


export class SafeNode<T extends JsonObject> extends Node<T> {
  constructor(
    value: T,
    downstream: PatchStream,
    upstream: PatchChannel,
  ) {
    super(
      value,
      downstream.pipe(
        filter(patch => !validate(patch, this.value))
      ),
      upstream
    )
  }
}
