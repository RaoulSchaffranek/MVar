---
sidebar: auto
---

# MVar Docs

## Introduction

MVar is a low-level library for concurrent programming in TypeScript and JavaScript. It provides a single data type of the same name. An `MVar` represents an abstract resource that can be shared by multiple concurrent tasks. Access-operations on MVars are atomic and serve as synchronization primitives between concurrent tasks.

An `MVar` is always in one of two states: It's either empty or holds some value. The two most important operations are `put` for writing to the MVar and `take` for reading its contents. Unlike traditional variables, the `put` methods first checks if the `MVar` is currently empty. If that's the case, then `put` writes the supplied value to the `MVar`; otherwise, it queues the value for later consumption. Similarly, `take` first checks if the `MVar` is currently full. In that case, `take` returns the contents wrapped in a promise which is synchronously resolved. Otherwise, `take` returns a promise, which is resolved as soon as the `MVar` becomes full. When the promise resolves, the `MVar` contents are replaced with the next value, that was queued by `put` if one is available; otherwise, it's left empty.

### Why MVar?

MVar is developed as part of a runtime-system-extension for another programming-language called Idris. Existing concurrency libraries were either too heavyweight or too high-level for this purpose. Thus, the goal of MVar is to support library-authors and compiler-implementors to provide higher-level concurrency abstractions.

### Why not?

Application-developers, on the other hand, are advised to choose a higher-level library for concurrency. For instance, a redux-store is very similar to a MVar. It also synchronizes control-flow and additionally manages application-state through state-reducers.


## Installation

MVar is available as a npm-package.

When using npm:

~~~bash
npm i mvar
~~~

When using yarn:

~~~bash
yarn mvar
~~~

## Importing

TypeScript / ES6

~~~ts
import {MVar} from 'mvar'
~~~

ES5 (CommonJS)

~~~js
var MVar = require('mvar').MVar
~~~


ES5 (UMD build)

~~~js
MVar.MVar
~~~

## Example

Let's write a simple counter-application using MVar. The application will have
buttons to increment and decrement the counter. We will use an MVar to mediate
the button-clicks through a synchronized communication-channel and implement
an explicit event-loop on top of it:

<iframe style="width:100%; min-height:41rem" src="https://stackblitz.com/edit/mvar-counter?embed=1&file=index.ts&hideExplorer=1"></iframe>

## API

### `MVar.newEmpty`

Create a MVar which is initially empty.

~~~ts
const mvar = MVar.newEmpty()
~~~

### `MVar.new`

Create a MVar which contains the supplied value.

~~~ts
const mvar = MVar.new(x)
~~~

### `MVar.prototype.take`

Return the contents of the MVar wrapped in a promise.

If the MVar is empty, the promise resolves once the MVar becomes full.
If the MVar is full, the returned promise resolves synchronously
with the contents.

When the promise is resolved, the MVar is left empty.

~~~ts
mvar.take()
~~~

### `MVar.prototype.put`

Put a value into a MVar.

If the MVar is empty, sets the contents of the MVar.
If the MVar is full, queues the value until the MVar becomes empty.

~~~ts
mvar.put(x)
~~~

### `MVar.prototype.read`

Read the contents of a MVar wrapped in a promise.

If the MVar is empty, the returned promise is resolved once the MVar
becomes full.
If the MVar is full, the returned promise is synchronously
resolved with the contents.

Read does not alter the contents of the MVar.

~~~ts
mvar.read()
~~~

### `MVar.prototype.swap`

Take a value from a MVar, put a new value into the MVar and return the old value wrapped in a promise.

If the MVar is empty, the promise resolves once the MVar becomes full.
If the MVar is full, the returned promise resolves synchronously
with the contents.

Queues the supplied value for later consumption.

~~~ts
mvar.swap(x)
~~~

### `MVar.prototype.tryTake`

A synchronous version of take.

If the MVar is empty, throws an exception.
If the MVar is full, returns the contents of the MVar.

After tryTake executed, the MVar is left empty.

~~~ts
mvar.tryTake()
~~~


### `MVar.prototype.tryPut`

A synchronous version of put.

If the MVar is empty, sets the contents of the MVar and returns true.
If the MVar is full, does nothing and returns false

~~~ts
mvar.tryPut(x)
~~~

### `MVar.prototype.isEmpty`

Check whether a given MVar is empty.

If the MVar is empty, returns true.
If the MVar is full, returns false.

~~~ts
mvar.isEmpty()
~~~

### `MVar.prototype.tryRead`

A synchronous version of read.

If the MVar is empty, throws an exception.
If the MVar is full, returns the contents of the MVar.

tryRead does not alter the contents of the MVar.

~~~ts
mvar.tryRead()
~~~
