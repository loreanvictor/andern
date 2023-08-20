import { Observable, Observer, Subject } from 'rxjs'
import { Patch, PatchChannel } from './types'


export const createEcho: () => PatchChannel
  = () => new Subject<Patch>()


class Bundled<T> extends Observable<T> implements Observer<T> {
  constructor(
    source: Observable<T>,
    private readonly sink: Observer<T>
  ) {
    super(subscriber => source.subscribe(subscriber))
  }

  next(value: T) { this.sink.next(value) }
  error(err: any) { this.sink.error(err) }
  complete() { this.sink.complete() }
}


export const bundle = <T>(src: Observable<T>, sink: Observer<T>) =>
  new Bundled(src, sink)
