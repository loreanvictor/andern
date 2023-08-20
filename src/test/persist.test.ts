import { Subject } from 'rxjs'
import { PersistedNode } from '../persist'
import { Message } from '../types'


describe(PersistedNode, () => {
  test('it should persist messages it sends to given messaging channel.', async () => {
    const channel = new Subject<Message>()

    const cb1 = jest.fn()
    const cb2 = jest.fn()

    const object = { foo: 'bar', baz: { qux: 'quux' } }
    const node1 = new PersistedNode(object, cb1, channel).child('/foo')
    const node2 = new PersistedNode(object, cb2, channel).child('/baz').child('/qux')

    node1.subscribe()
    node2.subscribe()

    node1.set('', 'biz')
    node2.set('', 'corge')

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
    expect(cb1).toHaveBeenCalledWith([{ op: 'replace', path: '/foo', value: 'biz' }])
    expect(cb2).toHaveBeenCalledWith([{ op: 'replace', path: '/baz/qux', value: 'corge' }])
  })
})
