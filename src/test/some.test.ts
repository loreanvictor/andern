import { type } from 'ts-inference-check'

import { andern } from '..'
import { Message } from '../types'


describe(andern, () => {
  test('does stuff.', () => {
    expect(andern().msg).toBe('Hellow, this is andern!')
  })

  test('returns the proper type.', () => {
    expect(type(andern()).is<Message>(true)).toBe(true)
  })
})
