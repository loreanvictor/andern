import { JsonObject } from 'json-pointer'
import { Operation, compare } from 'fast-json-patch'

import { ReadOnlyNode } from './readonly'
import { NodeLike, Patch, PatchChannel, ReadOnlyNodeLike } from './types'
import { bundle } from './utils'


export class Node<T extends JsonObject> extends ReadOnlyNode<T> implements NodeLike<T> {
  readonly channel: PatchChannel

  constructor(
    initial: T,
    channel: PatchChannel,
  ) {
    super(initial, channel)
    this.channel = bundle(this.patches, channel)
  }

  override read(path: string): ReadOnlyNodeLike<any> {
    return super.child(path)
  }

  override child(path: string): NodeLike<any> {
    return new Node(
      this.childValue(path),
      this.childChannel(path),
    )
  }

  patch(patch: Patch | Operation): this {
    if (Array.isArray(patch)) {
      this.channel.next(patch)
    } else {
      this.channel.next([patch])
    }

    return this
  }

  set(path: string, value: any): this {
    return this.patch([{ op: 'replace', path, value }])
  }

  remove(path: string): this {
    return this.patch([{ op: 'remove', path }])
  }

  next(value: T): void {
    this.channel.next(compare(this.value, value))
  }

  error(err: any): void {
    this.channel.error(err)
  }

  complete(): void {
    this.channel.complete()
  }

  protected childChannel(path: string): PatchChannel {
    return bundle(
      this.childStream(path),
      {
        next: patch => this.channel.next(patch.map(({ path: p, ...rest }) => ({ ...rest, path: path + p }))),
        error: () => {},
        complete: () => {},
      }
    )
  }
}
