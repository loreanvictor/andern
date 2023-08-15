import { JsonObject } from 'json-pointer'
import { Operation, compare } from 'fast-json-patch'

import { ReadOnlyNode } from './readonly'
import { NodeLike, Patch, PatchChannel, PatchStream, ReadOnlyNodeLike } from './types'


export class Node<T extends JsonObject> extends ReadOnlyNode<T> implements NodeLike<T> {
  constructor(
    initial: T,
    downstream: PatchStream,
    protected upstream: PatchChannel
  ) {
    super(initial, downstream)
  }

  read(path: string): ReadOnlyNodeLike<any> {
    return super.child(path)
  }

  override child(path: string): NodeLike<any> {
    return new Node(
      this.childValue(path),
      this.childStream(path),
      this.childChannel(path),
    )
  }

  patch(patch: Patch | Operation): this {
    if (Array.isArray(patch)) {
      this.upstream.next(patch)
    } else {
      this.upstream.next([patch])
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
    this.upstream.next(compare(this.value, value))
  }

  error(err: any): void {
    this.upstream.error(err)
  }

  complete(): void {
    this.upstream.complete()
  }

  protected childChannel(path: string): PatchChannel {
    return {
      next: patch => this.upstream.next(patch.map(({ path: p, ...rest }) => ({ ...rest, path: path + p }))),
      error: () => {},
      complete: () => {},
    }
  }
}
