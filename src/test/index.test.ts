import { Subject } from 'rxjs'
import { Node, Patch, createEcho, createRoot } from '../index'


test('nodes can receive changes, which will propagate to children properly.', () => {
  const root = createRoot({ foo: 'bar', baz: [{ fluff: 42 }] })

  const cb1 = jest.fn()
  const cb2 = jest.fn()
  const cb3 = jest.fn()

  root.child('/foo').subscribe(cb1)
  root.child('/foo').subscribe(cb2)
  root.read('/baz/0').read('/fluff').subscribe(cb3)

  root.set('/foo', 'qux')

  expect(cb1).toHaveBeenCalledTimes(2)
  expect(cb2).toHaveBeenCalledTimes(2)
  expect(cb3).toHaveBeenCalledTimes(1)

  root.set('/baz/0/fluff', 43)

  expect(cb1).toHaveBeenCalledTimes(2)
  expect(cb2).toHaveBeenCalledTimes(2)
  expect(cb3).toHaveBeenCalledTimes(2)
  expect(cb1).toHaveBeenNthCalledWith(1, 'bar')
  expect(cb1).toHaveBeenNthCalledWith(2, 'qux')
  expect(cb2).toHaveBeenNthCalledWith(1, 'bar')
  expect(cb2).toHaveBeenNthCalledWith(2, 'qux')
  expect(cb3).toHaveBeenNthCalledWith(1, 42)
  expect(cb3).toHaveBeenNthCalledWith(2, 43)
})

test('nodes can receive changes from children and sync them as well.', () => {
  const root = createRoot({ foo: 'bar', baz: [{ fluff: 42 }] })

  const cb1 = jest.fn()
  const cb2 = jest.fn()
  const cb3 = jest.fn()

  root.read('/foo').subscribe(cb1)
  root.child('/baz/0/fluff').subscribe(cb2)
  root.child('/baz/0').subscribe(v => cb3(JSON.stringify(v)))

  root.child('/foo').set('', 'qux')

  expect(cb1).toHaveBeenCalledTimes(2)
  expect(cb2).toHaveBeenCalledTimes(1)
  expect(cb3).toHaveBeenCalledTimes(1)

  root.child('/baz/0').set('/fluff', 43)

  expect(cb1).toHaveBeenCalledTimes(2)
  expect(cb2).toHaveBeenCalledTimes(2)
  expect(cb3).toHaveBeenCalledTimes(2)

  expect(cb1).toHaveBeenNthCalledWith(1, 'bar')
  expect(cb1).toHaveBeenNthCalledWith(2, 'qux')
  expect(cb2).toHaveBeenNthCalledWith(1, 42)
  expect(cb2).toHaveBeenNthCalledWith(2, 43)
  expect(cb3).toHaveBeenNthCalledWith(1, JSON.stringify({ fluff: 42 }))
  expect(cb3).toHaveBeenNthCalledWith(2, JSON.stringify({ fluff: 43 }))

  root.child('/baz/0').remove('/fluff')

  expect(cb2).toHaveBeenCalledTimes(3)
  expect(cb3).toHaveBeenCalledTimes(3)
  expect(cb2).toHaveBeenNthCalledWith(3, null)
  expect(cb3).toHaveBeenNthCalledWith(3, JSON.stringify({}))
})

test('nodes can distinguish changes and propagate them properly.', () => {
  const root = createRoot({ foo: 'bar', baz: [{ fluff: 42 }] })

  const cb1 = jest.fn()
  const cb2 = jest.fn()
  const cb3 = jest.fn()

  root.read('/foo').subscribe(cb1)
  root.child('/baz/0/fluff').subscribe(cb2)
  root.child('/baz/0').subscribe(v => cb3(JSON.stringify(v)))

  root.next({
    foo: 'bar',
    baz: [{ fluff: 43 }],
  })

  expect(cb1).toHaveBeenCalledTimes(1)
  expect(cb2).toHaveBeenCalledTimes(2)
  expect(cb3).toHaveBeenCalledTimes(2)

  expect(cb1).toHaveBeenNthCalledWith(1, 'bar')
  expect(cb2).toHaveBeenNthCalledWith(1, 42)
  expect(cb2).toHaveBeenNthCalledWith(2, 43)
  expect(cb3).toHaveBeenNthCalledWith(1, JSON.stringify({ fluff: 42 }))
  expect(cb3).toHaveBeenNthCalledWith(2, JSON.stringify({ fluff: 43 }))
})

test('nodes can be treated as a patch channel.', () => {
  const sub = new Subject<Patch>()
  const root = createRoot({ foo: 'bar' })

  const cb = jest.fn()
  root.read('/foo').subscribe(cb)
  sub.subscribe(root.channel)
  sub.next([{ op: 'replace', path: '/foo', value: 'qux' }])

  expect(cb).toHaveBeenCalledTimes(2)
  expect(cb).toHaveBeenNthCalledWith(1, 'bar')
  expect(cb).toHaveBeenNthCalledWith(2, 'qux')
})

test('nodes up propagate errors.', () => {
  const echo = createEcho()
  const root = new Node({ foo: 'bar', baz: [{ fluff: 42 }] }, echo)

  const cb = jest.fn()
  echo.subscribe({ error: cb })

  root.error(new Error('test'))

  expect(cb).toHaveBeenCalledTimes(1)
})

test('nodes up propagate completion.', () => {
  const echo = createEcho()
  const root = new Node({ foo: 'bar', baz: [{ fluff: 42 }] }, echo)

  const cb = jest.fn()
  echo.subscribe({ complete: cb })

  root.complete()

  expect(cb).toHaveBeenCalledTimes(1)
})

test('children seeing errors or completion will not propagate them up.', () => {
  const root = new Node({ foo: 'bar', baz: [{ fluff: 42 }] }, createEcho())

  const cb = jest.fn()
  root.subscribe({ error: cb, complete: cb })

  root.child('/foo').error(new Error('test'))
  root.child('/foo').complete()

  expect(cb).toHaveBeenCalledTimes(0)
})

test('nodes accept single operations for patching.', () => {
  const root = new Node({ foo: 'bar', baz: [{ fluff: 42 }] }, createEcho())

  const cb1 = jest.fn()
  const cb2 = jest.fn()

  root.read('/foo').subscribe(cb1)
  root.child('/baz/0/fluff').subscribe(cb2)

  root.patch({ op: 'replace', path: '/foo', value: 'qux' })

  expect(cb1).toHaveBeenCalledTimes(2)
  expect(cb2).toHaveBeenCalledTimes(1)
  expect(cb1).toHaveBeenNthCalledWith(1, 'bar')
  expect(cb1).toHaveBeenNthCalledWith(2, 'qux')
  expect(cb2).toHaveBeenNthCalledWith(1, 42)
})

test('wrong patches are not applied', () => {
  const root = createRoot({ foo: 'bar' })

  const cb = jest.fn()

  root.read('/foo').subscribe(cb)

  root.patch({ op: 'remove', path: '/foo/x/3' })
  root.patch({ op: 'replace', path: '/foo', value: 'qux' })

  expect(cb).toHaveBeenCalledTimes(2)
  expect(cb).toHaveBeenNthCalledWith(1, 'bar')
  expect(cb).toHaveBeenNthCalledWith(2, 'qux')
})
