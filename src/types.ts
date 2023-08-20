import { Observable, Observer } from 'rxjs'
import { Operation } from 'fast-json-patch'


export type Patch = Operation[]
export type PatchStream = Observable<Patch>
export type PatchChannel = PatchStream & Observer<Patch>


export interface ReadOnlyNodeLike<T> extends Observable<T> {
  get patches(): PatchStream
  child(path: string): ReadOnlyNodeLike<any>
  read(path: string): ReadOnlyNodeLike<any>
}


export interface NodeLike<T> extends ReadOnlyNodeLike<T>, Observer<T> {
  get channel(): PatchChannel
  child(path: string): NodeLike<any>
  read(path: string): ReadOnlyNodeLike<any>

  patch(patch: Patch): this
  set(path: string, value: any): this
  remove(path: string): this
}

