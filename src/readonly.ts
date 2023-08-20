import { applyPatch } from 'fast-json-patch'
import { JsonObject, get } from 'json-pointer'
import { Observable, filter, map, share, tap } from 'rxjs'

import { PatchStream, ReadOnlyNodeLike } from './types'


export class ReadOnlyNode<T extends JsonObject> extends Observable<T> implements ReadOnlyNodeLike<T> {
  readonly patches: PatchStream
  protected values: Observable<T>
  protected value: T

  constructor(
    initial: T,
    protected stream: PatchStream
  ) {
    super(subscriber => {
      subscriber.next(this.value)
      this.values.subscribe(subscriber)
    })

    this.value = initial
    this.patches = this.stream.pipe(
      tap(patch => this.value = applyPatch(this.value, patch).newDocument),
      share(),
    )
    this.values = this.patches.pipe(map(() => this.value))
  }

  child(path: string): ReadOnlyNodeLike<any> {
    return new ReadOnlyNode(this.childValue(path), this.childStream(path))
  }

  read(path: string): ReadOnlyNodeLike<any> {
    return this.child(path)
  }

  protected childValue(path: string): any {
    return get(this.value, path)
  }

  protected childStream(path: string): PatchStream {
    return this.patches.pipe(
      map(patch => patch
        .filter(({ path: p }) => p.startsWith(path))
        .map(({ path: p, ...rest }) => ({ ...rest, path: p.slice(path.length) }))
      ),
      filter(patch => patch.length > 0)
    )
  }
}
