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
