<div align="right">

[![bundle size](https://img.shields.io/bundlephobia/minzip/andern@latest?color=black&label=&style=flat-square)](https://bundlephobia.com/package/andern@latest)
[![version](https://img.shields.io/npm/v/andern?color=black&label=&style=flat-square)](https://www.npmjs.com/package/andern)
[![tests](https://img.shields.io/github/actions/workflow/status/loreanvictor/andern/coverage.yml?label=&style=flat-square)](https://github.com/loreanvictor/andern/actions/workflows/coverage.yml)

</div>

<img src="./logo-dark.svg#gh-dark-mode-only" height="51px"/>
<img src="./logo-light.svg#gh-light-mode-only" height="51px"/>

change propagation for object trees

```js
import { Node } from 'andern'

const node = new Node({
  people: [
    { name: 'John', age: 20 },
    { name: 'Jane', age: 21 },
  ]
})

node.child('/people/1/age').subscribe(console.log)
node.child('/people/0').set('/age', 32)
```

> 🚧🚧 **DO NOT USE**, _work in progress_

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
import { Node } from 'https://esm.sh/andern'
```

<br>

# Usage

> 🚧🚧 WORK IN PROGRESS 🚧🚧

This library offers utilities to handle changes in object trees, based on [JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901), [JSON Patch](https://jsonpatch.com) and [RxJS](https://rxjs.dev).

```js
import { Node } from 'andern'

const node = new Node({
  people: [
    { name: 'John', age: 20, title: 'Mr.' },
    { name: 'Jane', age: 21 },
  ]
})

const child = node.child('/people/0')
child.next({ name: 'John', age: 32 })
child.set('/age', 33)
child.patch({
  op: 'remove',
  path: '/title',
})

node.read('/people/0/age').subscribe(console.log)

const parent = new Node({
  company: 'X',
  org: {}
})

parent.adopt('/org', node)
parent.read('/org/people/0/age').subscribe(console.log)
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
