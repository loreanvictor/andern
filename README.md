<div align="right">

[![bundle size](https://img.shields.io/bundlephobia/minzip/andern@latest?color=black&label=&style=flat-square)](https://bundlephobia.com/package/andern@latest)
[![version](https://img.shields.io/npm/v/andern?color=black&label=&style=flat-square)](https://www.npmjs.com/package/andern)
[![tests](https://img.shields.io/github/actions/workflow/status/loreanvictor/andern/coverage.yml?label=&style=flat-square)](https://github.com/loreanvictor/andern/actions/workflows/coverage.yml)

</div>

<img src="./logo-dark.svg#gh-dark-mode-only" height="51px"/>
<img src="./logo-light.svg#gh-light-mode-only" height="51px"/>

`ändern` helps with tracking changes across an object tree. Use it to wrap and modify an object, and you'd get [observables](https://rxjs.dev/guide/observable) notifying you when [some part of the object](https://datatracker.ietf.org/doc/html/rfc6901) changes, and [what the changes are](https://jsonpatch.com).

```js
import { createRoot } from 'andern'

const root = createRoot({
  people: [
    { name: 'John', age: 20 },
    { name: 'Jane', age: 21 },
  ]
})

// 👇 subscribe to a part of the tree
root.child('/people/1').subscribe(console.log)

// 👇 manually set a specific part of the tree
root.child('/people/1/age').set('', 32)

// 👇 apply a patch to a specific part of the tree
root.child('/people').patch({ op: 'remove', path: '/1/age' })

```

<div align="right">

[**▷ TRY IT**](https://codepen.io/lorean_victor/pen/VwVoOdM?editors=0012)

</div>

<br>

# Contents

- [Contents](#contents)
- [Installation](#installation)
- [Usage](#usage)
- [Advanced Usage](#advanced-usage)
  - [Nodes](#nodes)
  - [Safety](#safety)
- [How it Works](#how-it-works)
- [Contribution](#contribution)

<br>

# Installation

[Node](https://nodejs.org/en/):

```bash
npm i andern
```

Browser / [Deno](https://deno.land):

```js
import { createRoot } from 'https://esm.sh/andern'
```

<br>

# Usage

`ändern` helps with propagating and tracking changes across some object (for example, managing application state). It treats the object as a tree: the root represents the whole object, and child nodes representing various parts of it. You can subscribe to different parts of the tree, modify or patch them, etc, and `ändern` will make sure that all changes are propagated exactly to the correct subscribers.


👉 Create a root node:
```js
import { createRoot } from 'andern'

const root = createRoot({
  people: [
    { name: 'John', age: 20 },
    { name: 'Jane', age: 21 },
  ]
})
```
<br>

👉 Get a child node:
```js
const john = root.child('/people/0')
```

> Child nodes are specified in [JSON Pointer](https://gregsdennis.github.io/Manatee.Json/usage/pointer.html) format.

<br>

👉 Subscribe to a node's values:
```js
john.subscribe(console.log)
root.child('/people/1').subscribe(console.log)
```

> Each node is an [observable](https://rxjs.dev/guide/observable) that emits the current value of the node whenever it changes.

<br>

👉 Update the node:
```js
john.set('/name', 'Johnny')
```
```js
john.add('/title', 'Dr.')
```
```js
john.remove('/age')
```

> To change the whole object, use `''` as the path. Alternatively, you can use `node.next(...)`, as each node is also an [observer](https://rxjs.dev/guide/observer).

<br>

👉 Subscribe to its changes:
```js
john.patches.subscribe(console.log)
```

👉 Apply a patch:
```js
john.patch({ op: 'replace', path: '/name', value: 'Johnny' })
```

> Changes are expressed in [JSON Patch](https://jsonpatch.com) format.

<br>

👉 Use `.read()` method to get readonly nodes:

```js
const john = root.read('/people/0')
```

<br>

# Advanced Usage

### Nodes

The core construct of `ändern` is the [`Node`](./src/node.ts) class, which tracks and notifies of changes in some part of an object tree.

```ts
class Node<T>
  extends Observable<T>
  implements Observer<T> {

  constructor(
    initial:  T,
    downstream: PatchStream,
    upstream: PatchChannel,
  );

  read(path: string): ReadonlyNode<T>;
  child(path: string): Node<T>;
  channel(): Observer<Patch>;
  patch(patch: Patch | Operation): this;
  set(path: string, value: any): this;  
  remove(path: string): this;

  // and some inherited methods
}
```

To create a `Node`, you need an _upstream_ and a _downstream_:

- _downstream_ should be a [`PatchStream`](./src/types.ts) (i.e. [`Observable`](https://rxjs.dev/guide/observable)`<`[`Patch`](https://jsonpatch.com)`>`), through which the parent informs the node of changes to its value.

- _upstream_ should be a [`PatchChannel`](./src/types.ts) (i.e. [`Observer`](https://rxjs.dev/guide/observer)`<`[`Patch`](https://jsonpatch.com)`>`), through which the node informs its parent of requested changes to its value.

<br>

When a node is requested to change (through its `.set()`, `.remove()`, `.patch()`, or `.next()` methods), it will calculate the necessary changes and send them to _upstream_. It will apply the changes when they are received from the _downstream_, notifying subscribers ([read more](#how-it-works)).

Use this to create nodes with custom behavior. For example, this is a _root node_ that debounces incoming changes:

```ts
import { Node } from 'andern'
import { Subject, debounceTime } from 'rxjs'

const bounce = new Subject()
const root = new Node(
  { /* some initial value */},
  bounce.pipe(debounceTime(100)),
  bounce,
)
```

<div align="right">

[**▷ TRY IT**](https://codepen.io/lorean_victor/pen/rNoNwVO?editors=1010)

</div>

### Safety

A `Node` receiving a patch that it can't apply will result in an error, closing the stream. If you want to ignore such erroneous patches, use `SafeNode` class instead.

```ts
import { SafeNode } from 'andern'

const root = new SafeNode(
  /* ... */
)
```

<br>

> `createRoot()` uses `SafeNode` by default, so you don't need to worry about safety in normal use cases. You need to think about it only if you're creating custom nodes.

<br>

# How it Works

`ändern` uses trees, composed of [`Node`s](#nodes), for tracking changes across objects. Each node is an [`Observable`](https://rxjs.dev/guide/observable) and an [`Observer`](https://rxjs.dev/guide/observer) for a designated part of the tree, represented by some [JSON pointer](https://gregsdennis.github.io/Manatee.Json/usage/pointer.html). For an object (tree) like this:

```js
const object = {
  people: [
    { name: 'John', age: 20 },
    { name: 'Jane', age: 21 },
  ],
  orgname: 'ACME',
}
```

You can track (or apply) changes to the organisation name like this:

```ts
const root = createRoot(object)
const orgname = root.child('/orgname')
```

and you can track (or apply) changes to the first person's name like this:

```ts
const john = root.child('/people/0/name')
```

> **IMPORTANT**
>
> `ändern` does not track changes to the object itself, i.e it does not create proxies, or alter the original object in any way. A `Node` can only track changes that are applied by some other nodes in the same tree (i.e. having the same root).

<br>

When a node is requested to change (through its `.set()`, `.remove()`, `.patch()`, or `.next()` methods), it will calculate the necessary changes and send them to its _upstream_. In case of `.next()`, it diffs the current value and the _next_ value for calculating the patch (so its slower to use `.next()` compared to other methods).

The calculated patch won't be applied immediately, it will be sent to the _upstream_ first, where the parent will correct the _path_ of the patch, and send it upwards again. Eventually, the patch is bounced back by the root node (if it is a valid change), and will be downpropagated across the tree to nodes with a matching path (with the path again being corrected for each child node that receives the patch). During this process, the originating node will also receive the same patch from its _downstream_, applying the patch and notifying its subscribers.

The whole process looks like this (you can also checkout the [live demo](https://codepen.io/lorean_victor/full/vYvBZKa)):

<div align="center">
<img src="./misc/readme-diagram.svg#gh-dark-mode-only" width="640px"/>
<img src="./misc/readme-diagram-light.svg#gh-light-mode-only" width="640px"/>
</div>

> ![0](./misc/diagram-red-0.svg) a patch is applied to observer #2. \
> ![1](./misc/diagram-orange-1.svg) observer #2 up-propagates the following patch to its parent, observer #1:
>  ```js
>  { "path": "", "op": "replace", "value": 32 }
>  ```
> ![2](./misc/diagram-orange-2.svg) observer #1 up-propagates a similar patch with updated path to its parent, the root node:
> ```js
> { "path": "/0/age", ... }
> ```
> ![3](./misc/diagram-orange-3.svg) root up-propagates a similar patch with updated path:
> ```js
> { "path": "/people/0/age", ... }
> ```
> ![4](./misc/diagram-green-4.svg) the patch is echoed back to root. \
> ![5](./misc/diagram-blue-5.svg) root notifies all subscribers of change. \
> ![5](./misc/diagram-green-5.svg) root down-propagates similar patches with altered paths to its children, observer #3 and observer #1, respectively:
> ```js
> { "path": "/age", ... }
> ```
> ```js
> { "path": "/0/age", ... }
> ```
> ![6](./misc/diagram-blue-6.svg) observers #3 and #1 notify their subscribers of change. \
> ![6](./misc/diagram-green-6.svg) observer #1 down-propagates a similar patch with altered path to its child, observer #2:
> ```js
> { "path": "", ... }
> ```
> ![7](./misc/diagram-blue-7.svg) observer #2 notifies its subscribers of change.

<br>

# Contribution

You need [node](https://nodejs.org/en/), [NPM](https://www.npmjs.com) to start and [git](https://git-scm.com) to start.

```bash
# clone the code
git clone git@github.com:loreanvictor/andern.git
```
```bash
# install stuff
npm i
```

Make sure all checks are successful on your PRs. This includes all tests passing, high code coverage, correct typings and abiding all [the linting rules](https://github.com/loreanvictor/andern/blob/main/.eslintrc). The code is typed with [TypeScript](https://www.typescriptlang.org), [Jest](https://jestjs.io) is used for testing and coverage reports, [ESLint](https://eslint.org) and [TypeScript ESLint](https://typescript-eslint.io) are used for linting. Subsequently, IDE integrations for TypeScript and ESLint would make your life much easier (for example, [VSCode](https://code.visualstudio.com) supports TypeScript out of the box and has [this nice ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)), but you could also use the following commands:

```bash
# run tests
npm test
```
```bash
# check code coverage
npm run coverage
```
```bash
# run linter
npm run lint
```
```bash
# run type checker
npm run typecheck
```
