import { JsonObject } from 'json-pointer'
import { Node } from './node'
import { MessageChannel, Patch } from './types'
import { bundle, createId, noop } from './utils'
import { map, tap } from 'rxjs'


export class PersistedNode<T extends JsonObject> extends Node<T> {
  constructor(
    initial: T,
    persist: (patch: Patch) => Promise<void>,
    channel: MessageChannel,
    readonly identifier = createId(),
  ) {
    super(
      initial,
      bundle(
        channel.pipe(
          tap(async ({ sender, patch }) => {
            if (sender === identifier) {
              await persist(patch)
            }
          }),
          map(({ patch }) => patch),
        ),
        {
          next: patch => channel.next({ sender: identifier, patch }),
          error: noop,
          complete: noop,
        }
      )
    )
  }
}
