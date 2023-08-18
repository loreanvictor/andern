import {
  createEcho, ReadOnlyNode, ReadOnlyNodeLike, NodeLike, Patch, PatchChannel, PatchStream, Node, SafeNode,
} from '../index'


test('everything is exported.', () => {
  expect(createEcho).toBeDefined()
  expect(ReadOnlyNode).toBeDefined()
  expect(Node).toBeDefined()
  expect(SafeNode).toBeDefined()
  expect(<ReadOnlyNodeLike<unknown>>{}).toBeDefined()
  expect(<NodeLike<unknown>>{}).toBeDefined()
  expect(<Patch>{}).toBeDefined()
  expect(<PatchChannel>{}).toBeDefined()
  expect(<PatchStream>{}).toBeDefined()
})
