import { Subject } from 'rxjs'

import { Patch } from '../types'
import { ReadOnlyNode } from '../readonly'


describe(ReadOnlyNode, () => {
  test('it dispatches changes downstream.', () => {
    const src = new Subject<Patch>()
    const root = new ReadOnlyNode({ foo: 'bar', baz: [{ fluff: 42 }] }, src)

    const cb1 = jest.fn()
    const cb2 = jest.fn()
    const cb3 = jest.fn()

    root.subscribe(v => cb1(JSON.stringify(v)))
    root.child('/foo').subscribe(cb2)
    root.child('/baz/0/fluff').subscribe(cb3)

    src.next([{ op: 'replace', path: '/foo', value: 'qux' }])
    src.next([{ op: 'replace', path: '/baz/0/fluff', value: 43 }])
    src.next([{ op: 'add', path: '/baz/1', value: { fluff: 44 } }])

    expect(cb1).toHaveBeenCalledTimes(4)
    expect(cb2).toHaveBeenCalledTimes(2)
    expect(cb3).toHaveBeenCalledTimes(2)

    expect(cb1).toHaveBeenNthCalledWith(1, JSON.stringify({ foo: 'bar', baz: [{ fluff: 42 }] }))
    expect(cb1).toHaveBeenNthCalledWith(2, JSON.stringify({ foo: 'qux', baz: [{ fluff: 42 }] }))
    expect(cb1).toHaveBeenNthCalledWith(3, JSON.stringify({ foo: 'qux', baz: [{ fluff: 43 }] }))
    expect(cb1).toHaveBeenNthCalledWith(4, JSON.stringify({ foo: 'qux', baz: [{ fluff: 43 }, { fluff: 44 }] }))
    expect(cb2).toHaveBeenNthCalledWith(1, 'bar')
    expect(cb2).toHaveBeenNthCalledWith(2, 'qux')
    expect(cb3).toHaveBeenNthCalledWith(1, 42)
    expect(cb3).toHaveBeenNthCalledWith(2, 43)
  })

  test('it emits initial value immediately.', () => {
    const src = new Subject<Patch>()
    const root = new ReadOnlyNode({ foo: 'bar' }, src)

    const cb = jest.fn()
    root.subscribe(cb)

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith({ foo: 'bar' })
  })

  test('it emits initial value on children immediately as well.', () => {
    const src = new Subject<Patch>()
    const root = new ReadOnlyNode({ foo: 'bar' }, src)

    const cb = jest.fn()
    root.child('/foo').subscribe(cb)

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith('bar')
  })
})
