# MVar.ts

An MVar represents a shared, mutable variable. It can be thought of as an asynchronous first-in-first-out-queue, where `put` queues values and `take` takes values out of the queue. MVars are usefull to synchronize read- and write-operations on shared variables between concurrent tasks.

## Installation

MVar.ts is available as a npm-package.

~~~bash
npm i mvar
~~~
